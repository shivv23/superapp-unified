package repository

import (
	"errors"
	"sync"
	"time"

	"github.com/superapp-unified/auth/internal/model"
)

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrInvalidToken       = errors.New("invalid or expired token")
	ErrTokenRevoked       = errors.New("token revoked")
)

type UserRepository interface {
	CreateUser(user *model.User) error
	GetUserByEmail(email string) (*model.User, error)
	GetUserByID(id string) (*model.User, error)
	UpdateUser(user *model.User) error

	SaveRefreshToken(token *model.RefreshToken) error
	GetRefreshToken(token string) (*model.RefreshToken, error)
	RevokeRefreshToken(token string) error
	RevokeAllRefreshTokensForUser(userID string) error

	SaveEmailVerificationToken(token *model.EmailVerificationToken) error
	GetEmailVerificationToken(token string) (*model.EmailVerificationToken, error)
	DeleteEmailVerificationToken(token string) error

	SavePasswordResetToken(token *model.PasswordResetToken) error
	GetPasswordResetToken(token string) (*model.PasswordResetToken, error)
	DeletePasswordResetToken(token string) error
}

type InMemoryUserRepository struct {
	mu                    sync.RWMutex
	users                 map[string]*model.User
	usersByEmail          map[string]*model.User
	refreshTokens         map[string]*model.RefreshToken
	emailVerificationTokens map[string]*model.EmailVerificationToken
	passwordResetTokens   map[string]*model.PasswordResetToken
}

func NewInMemoryUserRepository() *InMemoryUserRepository {
	return &InMemoryUserRepository{
		users:                 make(map[string]*model.User),
		usersByEmail:          make(map[string]*model.User),
		refreshTokens:         make(map[string]*model.RefreshToken),
		emailVerificationTokens: make(map[string]*model.EmailVerificationToken),
		passwordResetTokens:   make(map[string]*model.PasswordResetToken),
	}
}

func (r *InMemoryUserRepository) CreateUser(user *model.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.usersByEmail[user.Email]; exists {
		return ErrEmailAlreadyExists
	}

	r.users[user.ID] = user
	r.usersByEmail[user.Email] = user
	return nil
}

func (r *InMemoryUserRepository) GetUserByEmail(email string) (*model.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	user, exists := r.usersByEmail[email]
	if !exists {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (r *InMemoryUserRepository) GetUserByID(id string) (*model.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	user, exists := r.users[id]
	if !exists {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (r *InMemoryUserRepository) UpdateUser(user *model.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.users[user.ID]; !exists {
		return ErrUserNotFound
	}

	r.users[user.ID] = user
	r.usersByEmail[user.Email] = user
	return nil
}

func (r *InMemoryUserRepository) SaveRefreshToken(token *model.RefreshToken) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.refreshTokens[token.Token] = token
	return nil
}

func (r *InMemoryUserRepository) GetRefreshToken(token string) (*model.RefreshToken, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	t, exists := r.refreshTokens[token]
	if !exists {
		return nil, ErrInvalidToken
	}
	if t.Revoked {
		return nil, ErrTokenRevoked
	}
	if time.Now().After(t.ExpiresAt) {
		return nil, ErrInvalidToken
	}
	return t, nil
}

func (r *InMemoryUserRepository) RevokeRefreshToken(token string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	t, exists := r.refreshTokens[token]
	if !exists {
		return ErrInvalidToken
	}
	t.Revoked = true
	return nil
}

func (r *InMemoryUserRepository) RevokeAllRefreshTokensForUser(userID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, t := range r.refreshTokens {
		if t.UserID == userID {
			t.Revoked = true
		}
	}
	return nil
}

func (r *InMemoryUserRepository) SaveEmailVerificationToken(token *model.EmailVerificationToken) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.emailVerificationTokens[token.Token] = token
	return nil
}

func (r *InMemoryUserRepository) GetEmailVerificationToken(token string) (*model.EmailVerificationToken, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	t, exists := r.emailVerificationTokens[token]
	if !exists {
		return nil, ErrInvalidToken
	}
	if time.Now().After(t.ExpiresAt) {
		return nil, ErrInvalidToken
	}
	return t, nil
}

func (r *InMemoryUserRepository) DeleteEmailVerificationToken(token string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.emailVerificationTokens, token)
	return nil
}

func (r *InMemoryUserRepository) SavePasswordResetToken(token *model.PasswordResetToken) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.passwordResetTokens[token.Token] = token
	return nil
}

func (r *InMemoryUserRepository) GetPasswordResetToken(token string) (*model.PasswordResetToken, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	t, exists := r.passwordResetTokens[token]
	if !exists {
		return nil, ErrInvalidToken
	}
	if time.Now().After(t.ExpiresAt) {
		return nil, ErrInvalidToken
	}
	return t, nil
}

func (r *InMemoryUserRepository) DeletePasswordResetToken(token string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.passwordResetTokens, token)
	return nil
}
