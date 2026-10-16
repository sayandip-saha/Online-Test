module Api
  class ExamSubmissionsController < ApplicationController
    before_action :authenticate_candidate!

    # POST /api/exam_submissions
    def create
      if current_candidate.exam_submissions.exists?
        render json: {
          error: "You have already completed your exam attempt. Only 1 attempt is permitted per candidate."
        }, status: :forbidden
        return
      end

      answers_data = params[:answers_payload] || params[:answers]
      raw_answers = answers_data.is_a?(String) ? answers_data : answers_data.to_json

      submission = current_candidate.exam_submissions.build(
        score: params[:score] || 0,
        total_questions: params[:total_questions] || 0,
        percentage: params[:percentage] || 0,
        correct_answers: params[:correct_answers] || 0,
        incorrect_answers: params[:incorrect_answers] || 0,
        unanswered_questions: params[:unanswered_questions] || 0,
        passed: Boolean(params[:passed]),
        answers_payload: raw_answers
      )

      if submission.save
        render json: {
          submission: submission.payload,
          message: "Exam submission recorded successfully in backend database."
        }, status: :created
      else
        render json: {
          error: "Failed to record exam submission.",
          errors: submission.errors.full_messages
        }, status: :unprocessable_entity
      end
    end

    # GET /api/exam_submissions
    def index
      submissions = current_candidate.exam_submissions.order(created_at: :desc)
      render json: {
        submissions: submissions.map(&:payload)
      }, status: :ok
    end

    # GET /api/exam_submissions/:id
    def show
      submission = current_candidate.exam_submissions.find_by(id: params[:id])

      if submission
        render json: { submission: submission.payload }, status: :ok
      else
        render json: { error: "Exam submission not found." }, status: :not_found
      end
    end

    private

    def Boolean(val)
      ActiveModel::Type::Boolean.new.cast(val)
    end
  end
end

