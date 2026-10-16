class ExamSubmission < ApplicationRecord
  belongs_to :candidate

  validates :score, :total_questions, :percentage, presence: true
  validates :score, :total_questions, :percentage, :correct_answers, :incorrect_answers, :unanswered_questions,
            numericality: { greater_than_or_equal_to: 0 }
  validate :single_attempt_per_candidate, on: :create

  def payload
    {
      id: id,
      candidate_id: candidate_id,
      score: score,
      total_questions: total_questions,
      percentage: percentage,
      correct_answers: correct_answers,
      incorrect_answers: incorrect_answers,
      unanswered_questions: unanswered_questions,
      passed: passed,
      answers_payload: parsed_answers,
      submitted_at: created_at.strftime("%Y-%m-%d %H:%M:%S")
    }
  end

  def parsed_answers
    return nil if answers_payload.blank?

    begin
      JSON.parse(answers_payload)
    rescue JSON::ParserError
      answers_payload
    end
  end

  private

  def single_attempt_per_candidate
    return unless candidate

    if candidate.exam_submissions.where.not(id: id).exists?
      errors.add(:base, "You have already completed your exam attempt.")
    end
  end

  private

  def single_attempt_per_candidate
    return unless candidate

    if candidate.exam_submissions.where.not(id: id).exists?
      errors.add(:base, "You have already completed your exam attempt. Only 1 attempt is allowed.")
    end
  end
end
