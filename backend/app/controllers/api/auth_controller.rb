module Api
  class AuthController < ApplicationController
    before_action :authenticate_candidate!, only: [:me]

    # POST /api/auth/register
    def register
      email = params[:email].to_s.strip.downcase
      dob = params[:date_of_birth].presence || params[:dateOfBirth].presence
      name = params[:name].to_s.strip

      candidate = Candidate.find_by("LOWER(email) = ?", email)

      if candidate
        if candidate.match_dob?(dob)
          token = JsonWebToken.encode(candidate_id: candidate.id, email: candidate.email)
          render json: {
            token: token,
            candidate: candidate_payload(candidate),
            message: "Candidate found. Logged in successfully."
          }, status: :ok
        else
          render json: {
            error: "A candidate with this email is already registered with a different Date of Birth."
          }, status: :unprocessable_entity
        end
        return
      end

      new_candidate = Candidate.new(name: name, email: email, date_of_birth: dob)

      if new_candidate.save
        token = JsonWebToken.encode(candidate_id: new_candidate.id, email: new_candidate.email)
        render json: {
          token: token,
          candidate: candidate_payload(new_candidate),
          message: "Registration successful."
        }, status: :created
      else
        render json: {
          error: new_candidate.errors.full_messages.join(", "),
          errors: new_candidate.errors.messages
        }, status: :unprocessable_entity
      end
    end

    # POST /api/auth/login
    def login
      email = params[:email].to_s.strip.downcase
      dob = params[:date_of_birth].presence || params[:dateOfBirth].presence

      if email.blank? || dob.blank?
        render json: { error: "Email and Date of Birth are required." }, status: :bad_request
        return
      end

      candidate = Candidate.find_by("LOWER(email) = ?", email)

      if candidate && candidate.match_dob?(dob)
        token = JsonWebToken.encode(candidate_id: candidate.id, email: candidate.email)
        render json: {
          token: token,
          candidate: candidate_payload(candidate),
          message: "Logged in successfully."
        }, status: :ok
      else
        render json: { error: "Invalid email or Date of Birth. Please check your credentials." }, status: :unauthorized
      end
    end

    # GET /api/auth/me
    def me
      render json: {
        candidate: candidate_payload(current_candidate)
      }, status: :ok
    end

    private

    def candidate_payload(candidate)
      {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        dateOfBirth: candidate.date_of_birth.strftime("%Y-%m-%d")
      }
    end
  end
end

