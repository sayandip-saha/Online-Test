class Candidate < ApplicationRecord
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i

  before_validation :normalize_email

  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: VALID_EMAIL_REGEX, message: "is not a valid email address" }
  validates :date_of_birth, presence: true

  def match_dob?(dob_value)
    return false if dob_value.blank? || date_of_birth.blank?

    begin
      parsed = dob_value.is_a?(Date) ? dob_value : Date.parse(dob_value.to_s)
      date_of_birth == parsed
    rescue ArgumentError
      false
    end
  end

  private

  def normalize_email
    self.email = email.to_s.strip.downcase if email.present?
  end
end
