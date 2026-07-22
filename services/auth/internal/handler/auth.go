package handler

import (
	"encoding/json"
	"net/http"
	"regexp"

	"github.com/go-chi/chi/v5"

	"github.com/superapp-unified/auth/internal/middleware"
	"github.com/superapp-unified/auth/internal/model"
	"github.com/superapp-unified/auth/internal/service"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) RegisterRoutes(r chi.Router) {
	r.Post("/api/v1/auth/register", h.Register)
	r.Post("/api/v1/auth/login", h.Login)
	r.Post("/api/v1/auth/refresh", h.Refresh)
	r.Post("/api/v1/auth/verify-email", h.VerifyEmail)
	r.Post("/api/v1/auth/forgot-password", h.ForgotPassword)
	r.Post("/api/v1/auth/reset-password", h.ResetPassword)

	r.Group(func(r chi.Router) {
		r.Use(middleware.AuthMiddleware(h.authService))
		r.Post("/api/v1/auth/logout", h.Logout)
		r.Get("/api/v1/auth/profile", h.GetProfile)
		r.Put("/api/v1/auth/profile", h.UpdateProfile)
	})
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req model.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := validateRegister(req); err != "" {
		writeError(w, http.StatusBadRequest, err)
		return
	}

	user, tokens, err := h.authService.Register(req)
	if err != nil {
		switch err {
		case service.ErrUserExists:
			writeError(w, http.StatusConflict, "email already registered")
		default:
			writeError(w, http.StatusInternalServerError, "failed to register user")
		}
		return
	}

	writeJSON(w, http.StatusCreated, model.APIResponse{
		Status:  "success",
		Message: "user registered successfully",
		Data: map[string]interface{}{
			"user":   user,
			"tokens": tokens,
		},
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req model.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "email and password are required")
		return
	}

	user, tokens, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		switch err {
		case service.ErrInvalidCredentials:
			writeError(w, http.StatusUnauthorized, "invalid email or password")
		default:
			writeError(w, http.StatusInternalServerError, "login failed")
		}
		return
	}

	writeJSON(w, http.StatusOK, model.APIResponse{
		Status:  "success",
		Message: "login successful",
		Data: map[string]interface{}{
			"user":   user,
			"tokens": tokens,
		},
	})
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var req model.RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.RefreshToken == "" {
		writeError(w, http.StatusBadRequest, "refresh_token is required")
		return
	}

	tokens, err := h.authService.RefreshToken(req.RefreshToken)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "invalid or expired refresh token")
		return
	}

	writeJSON(w, http.StatusOK, model.APIResponse{
		Status:  "success",
		Message: "token refreshed successfully",
		Data: map[string]interface{}{
			"tokens": tokens,
		},
	})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var req model.RefreshRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.authService.Logout(req.RefreshToken); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to logout")
		return
	}

	writeJSON(w, http.StatusOK, model.APIResponse{
		Status:  "success",
		Message: "logged out successfully",
	})
}

func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	user, err := h.authService.GetProfile(userID)
	if err != nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}

	writeJSON(w, http.StatusOK, model.APIResponse{
		Status: "success",
		Data: map[string]interface{}{
			"user": user,
		},
	})
}

func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req model.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	user, err := h.authService.UpdateProfile(userID, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update profile")
		return
	}

	writeJSON(w, http.StatusOK, model.APIResponse{
		Status:  "success",
		Message: "profile updated successfully",
		Data: map[string]interface{}{
			"user": user,
		},
	})
}

func (h *AuthHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	var req model.VerifyEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Token == "" {
		writeError(w, http.StatusBadRequest, "token is required")
		return
	}

	if err := h.authService.VerifyEmail(req.Token); err != nil {
		writeError(w, http.StatusBadRequest, "invalid or expired verification token")
		return
	}

	writeJSON(w, http.StatusOK, model.APIResponse{
		Status:  "success",
		Message: "email verified successfully",
	})
}

func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req model.ForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Email == "" {
		writeError(w, http.StatusBadRequest, "email is required")
		return
	}

	token, err := h.authService.GeneratePasswordResetToken(req.Email)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to process request")
		return
	}

	writeJSON(w, http.StatusOK, model.APIResponse{
		Status:  "success",
		Message: "password reset token generated",
		Data: map[string]interface{}{
			"reset_token": token,
		},
	})
}

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req model.ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Token == "" || req.NewPassword == "" {
		writeError(w, http.StatusBadRequest, "token and new_password are required")
		return
	}

	if len(req.NewPassword) < 8 {
		writeError(w, http.StatusBadRequest, "password must be at least 8 characters")
		return
	}

	if err := h.authService.ResetPassword(req.Token, req.NewPassword); err != nil {
		writeError(w, http.StatusBadRequest, "invalid or expired reset token")
		return
	}

	writeJSON(w, http.StatusOK, model.APIResponse{
		Status:  "success",
		Message: "password reset successfully",
	})
}

func validateRegister(req model.RegisterRequest) string {
	if req.Email == "" {
		return "email is required"
	}
	if req.Password == "" {
		return "password is required"
	}
	if len(req.Password) < 8 {
		return "password must be at least 8 characters"
	}
	if req.FullName == "" {
		return "full_name is required"
	}

	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(req.Email) {
		return "invalid email format"
	}

	return ""
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, model.APIResponse{
		Status:  "error",
		Message: message,
	})
}
