package service

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/superapp-unified/auth/internal/config"
	"github.com/superapp-unified/auth/internal/model"
	"github.com/superapp-unified/auth/internal/repository"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrUserExists         = errors.New("user already exists")
	ErrInvalidToken       = errors.New("invalid or expired token")
)

type AuthService struct {
	repo   repository.UserRepository
	config *config.Config
}

func NewAuthService(repo repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{repo: repo, config: cfg}
}

func (s *AuthService) Register(req model.RegisterRequest) (*model.User, *model.TokenPair, error) {
	if _, err := s.repo.GetUserByEmail(req.Email); err == nil {
		return nil, nil, ErrUserExists
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), s.config.BcryptCost)
	if err != nil {
		return nil, nil, err
	}

	now := time.Now()
	user := &model.User{
		ID:           generateID(),
		Email:        req.Email,
		PasswordHash: string(hash),
		FullName:     req.FullName,
		Phone:        req.Phone,
		IsVerified:   false,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, nil, err
	}

	tokens, err := s.generateTokenPair(user.ID)
	if err != nil {
		return nil, nil, err
	}

	return user, tokens, nil
}

func (s *AuthService) Login(email, password string) (*model.User, *model.TokenPair, error) {
	user, err := s.repo.GetUserByEmail(email)
	if err != nil {
		return nil, nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, nil, ErrInvalidCredentials
	}

	tokens, err := s.generateTokenPair(user.ID)
	if err != nil {
		return nil, nil, err
	}

	return user, tokens, nil
}

func (s *AuthService) RefreshToken(refreshToken string) (*model.TokenPair, error) {
	claims, err := s.validateRefreshToken(refreshToken)
	if err != nil {
		return nil, err
	}

	stored, err := s.repo.GetRefreshToken(refreshToken)
	if err != nil {
		return nil, err
	}
	if stored.Revoked {
		return nil, repository.ErrTokenRevoked
	}

	if err := s.repo.RevokeRefreshToken(refreshToken); err != nil {
		return nil, err
	}

	userID, _ := (*claims)["sub"].(string)
	return s.generateTokenPair(userID)
}

func (s *AuthService) Logout(refreshToken string) error {
	return s.repo.RevokeRefreshToken(refreshToken)
}

func (s *AuthService) LogoutAll(userID string) error {
	return s.repo.RevokeAllRefreshTokensForUser(userID)
}

func (s *AuthService) GetProfile(userID string) (*model.User, error) {
	return s.repo.GetUserByID(userID)
}

func (s *AuthService) UpdateProfile(userID string, req model.UpdateProfileRequest) (*model.User, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, err
	}

	if req.FullName != "" {
		user.FullName = req.FullName
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.AvatarURL != "" {
		user.AvatarURL = req.AvatarURL
	}
	user.UpdatedAt = time.Now()

	if err := s.repo.UpdateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) GenerateEmailVerificationToken(userID string) (string, error) {
	token := generateSecureToken()
	now := time.Now()
	evToken := &model.EmailVerificationToken{
		Token:     token,
		UserID:    userID,
		ExpiresAt: now.Add(24 * time.Hour),
	}
	if err := s.repo.SaveEmailVerificationToken(evToken); err != nil {
		return "", err
	}
	return token, nil
}

func (s *AuthService) VerifyEmail(token string) error {
	evToken, err := s.repo.GetEmailVerificationToken(token)
	if err != nil {
		return err
	}

	user, err := s.repo.GetUserByID(evToken.UserID)
	if err != nil {
		return err
	}

	user.IsVerified = true
	user.UpdatedAt = time.Now()
	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	return s.repo.DeleteEmailVerificationToken(token)
}

func (s *AuthService) GeneratePasswordResetToken(email string) (string, error) {
	user, err := s.repo.GetUserByEmail(email)
	if err != nil {
		return "", nil
	}

	token := generateSecureToken()
	now := time.Now()
	prToken := &model.PasswordResetToken{
		Token:     token,
		UserID:    user.ID,
		ExpiresAt: now.Add(1 * time.Hour),
	}
	if err := s.repo.SavePasswordResetToken(prToken); err != nil {
		return "", err
	}
	return token, nil
}

func (s *AuthService) ResetPassword(token, newPassword string) error {
	prToken, err := s.repo.GetPasswordResetToken(token)
	if err != nil {
		return err
	}

	user, err := s.repo.GetUserByID(prToken.UserID)
	if err != nil {
		return err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), s.config.BcryptCost)
	if err != nil {
		return err
	}

	user.PasswordHash = string(hash)
	user.UpdatedAt = time.Now()
	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	if err := s.repo.DeletePasswordResetToken(token); err != nil {
		return err
	}

	return s.repo.RevokeAllRefreshTokensForUser(user.ID)
}

func (s *AuthService) ValidateAccessToken(tokenStr string) (string, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(s.config.JWTSecret), nil
	})
	if err != nil {
		return "", err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return "", errors.New("invalid token")
	}

	userID, ok := claims["sub"].(string)
	if !ok || userID == "" {
		return "", errors.New("invalid token claims")
	}

	return userID, nil
}

func (s *AuthService) generateTokenPair(userID string) (*model.TokenPair, error) {
	now := time.Now()

	accessClaims := jwt.MapClaims{
		"sub": userID,
		"iat": now.Unix(),
		"exp": now.Add(s.config.JWTAccessExpiry).Unix(),
		"typ": "access",
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessStr, err := accessToken.SignedString([]byte(s.config.JWTSecret))
	if err != nil {
		return nil, err
	}

	refreshClaims := jwt.MapClaims{
		"sub": userID,
		"iat": now.Unix(),
		"exp": now.Add(s.config.JWTRefreshExpiry).Unix(),
		"typ": "refresh",
	}
	refreshJWT := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshStr, err := refreshJWT.SignedString([]byte(s.config.JWTSecret))
	if err != nil {
		return nil, err
	}

	if err := s.repo.SaveRefreshToken(&model.RefreshToken{
		Token:     refreshStr,
		UserID:    userID,
		ExpiresAt: now.Add(s.config.JWTRefreshExpiry),
		Revoked:   false,
	}); err != nil {
		return nil, err
	}

	return &model.TokenPair{
		AccessToken:  accessStr,
		RefreshToken: refreshStr,
		ExpiresIn:    int64(s.config.JWTAccessExpiry.Seconds()),
	}, nil
}

func (s *AuthService) validateRefreshToken(tokenStr string) (*jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(s.config.JWTSecret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	typ, _ := claims["typ"].(string)
	if typ != "refresh" {
		return nil, errors.New("not a refresh token")
	}

	return &claims, nil
}

func generateID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func generateSecureToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}
