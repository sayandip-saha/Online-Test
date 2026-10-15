class ApplicationController < ActionController::API
  def current_candidate
    return @current_candidate if defined?(@current_candidate)

    header = request.headers["Authorization"]
    token = header.to_s.split(" ").last if header.present?

    if token.present?
      decoded = JsonWebToken.decode(token)
      if decoded && decoded[:candidate_id]
        @current_candidate = Candidate.find_by(id: decoded[:candidate_id])
        return @current_candidate
      end
    end

    @current_candidate = nil
  end

  def authenticate_candidate!
    render json: { error: "Unauthorized access. Please log in." }, status: :unauthorized unless current_candidate
  end
end
