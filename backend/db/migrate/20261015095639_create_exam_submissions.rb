class CreateExamSubmissions < ActiveRecord::Migration[7.2]
  def change
    create_table :exam_submissions do |t|
      t.references :candidate, null: false, foreign_key: true
      t.integer :score, null: false, default: 0
      t.integer :total_questions, null: false, default: 0
      t.integer :percentage, null: false, default: 0
      t.integer :correct_answers, null: false, default: 0
      t.integer :incorrect_answers, null: false, default: 0
      t.integer :unanswered_questions, null: false, default: 0
      t.boolean :passed, null: false, default: false
      t.text :answers_payload

      t.timestamps
    end
  end
end
