module Api
  class AdminController < ApplicationController
    ADMIN_PASSCODE = ENV.fetch("ADMIN_PASSCODE", "admin123")

    before_action :authenticate_admin!

    # GET /api/admin/stats
    def stats
      total_candidates = Candidate.count
      total_submissions = ExamSubmission.count
      passed_count = ExamSubmission.where(passed: true).count
      failed_count = ExamSubmission.where(passed: false).count
      avg_score = total_submissions > 0 ? ExamSubmission.average(:score).to_f.round(1) : 0
      avg_percentage = total_submissions > 0 ? ExamSubmission.average(:percentage).to_f.round(1) : 0
      pass_rate = total_submissions > 0 ? ((passed_count.to_f / total_submissions) * 100).round(1) : 0

      render json: {
        total_candidates: total_candidates,
        total_submissions: total_submissions,
        passed_count: passed_count,
        failed_count: failed_count,
        average_score: avg_score,
        average_percentage: avg_percentage,
        pass_rate: pass_rate
      }, status: :ok
    end

    # GET /api/admin/submissions
    def submissions
      records = ExamSubmission.includes(:candidate).order(created_at: :desc)
      data = records.map do |s|
        s.payload.merge(
          candidate_name: s.candidate&.name || "Unknown Candidate",
          candidate_email: s.candidate&.email || "No Email",
          candidate_dob: s.candidate&.date_of_birth&.strftime("%Y-%m-%d") || "N/A"
        )
      end

      render json: { submissions: data }, status: :ok
    end

    # GET /api/admin/candidates
    def candidates
      records = Candidate.includes(:exam_submissions).order(created_at: :desc)
      data = records.map do |c|
        last_sub = c.exam_submissions.order(created_at: :desc).first
        {
          id: c.id,
          name: c.name,
          email: c.email,
          date_of_birth: c.date_of_birth&.strftime("%Y-%m-%d"),
          created_at: c.created_at.strftime("%Y-%m-%d %H:%M:%S"),
          attempts_count: c.exam_submissions.count,
          has_attempted: c.exam_submissions.exists?,
          last_submission: last_sub ? {
            id: last_sub.id,
            score: last_sub.score,
            total_questions: last_sub.total_questions,
            percentage: last_sub.percentage,
            passed: last_sub.passed,
            submitted_at: last_sub.created_at.strftime("%Y-%m-%d %H:%M:%S")
          } : nil
        }
      end

      render json: { candidates: data }, status: :ok
    end

    # POST /api/admin/reset_attempt/:candidate_id
    def reset_attempt
      candidate = Candidate.find_by(id: params[:candidate_id])
      if candidate
        candidate.exam_submissions.destroy_all
        render json: {
          message: "Attempt reset successfully for #{candidate.name}. The candidate can now retake the exam."
        }, status: :ok
      else
        render json: { error: "Candidate not found." }, status: :not_found
      end
    end

    # DELETE /api/admin/submissions/:id
    def delete_submission
      submission = ExamSubmission.find_by(id: params[:id])
      if submission
        candidate_name = submission.candidate&.name
        submission.destroy
        render json: {
          message: "Submission deleted successfully#{candidate_name ? " for #{candidate_name}" : ""}."
        }, status: :ok
      else
        render json: { error: "Exam submission not found." }, status: :not_found
      end
    end

    # DELETE /api/admin/candidates/:id
    def delete_candidate
      candidate = Candidate.find_by(id: params[:id])
      if candidate
        candidate.destroy
        render json: { message: "Candidate #{candidate.name} and all associated records deleted." }, status: :ok
      else
        render json: { error: "Candidate not found." }, status: :not_found
      end
    end

    # POST /api/admin/clear_all
    def clear_all
      ExamSubmission.destroy_all
      Candidate.destroy_all
      ActiveRecord::Base.connection.execute("DELETE FROM sqlite_sequence WHERE name IN ('candidates', 'exam_submissions');")

      render json: { message: "All candidates and exam attempts have been permanently cleared." }, status: :ok
    end

    private

    def authenticate_admin!
      passcode = request.headers["X-Admin-Passcode"].presence || params[:admin_passcode].presence

      unless passcode.present? && passcode.to_s.strip == ADMIN_PASSCODE
        render json: { error: "Unauthorized: Invalid or missing admin passcode." }, status: :unauthorized
      end
    end
  end
end

