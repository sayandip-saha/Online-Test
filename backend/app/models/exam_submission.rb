class ExamSubmission < ApplicationRecord
  belongs_to :candidate

  validates :score, :total_questions, :percentage, presence: true
  validates :score, :total_questions, :percentage, :correct_answers, :incorrect_answers, :unanswered_questions,
            numericality: { greater_than_or_equal_to: 0 }

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
end
