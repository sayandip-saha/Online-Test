class CreateCandidates < ActiveRecord::Migration[7.2]
  def change
    create_table :candidates do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.date :date_of_birth, null: false

      t.timestamps
    end
    add_index :candidates, :email, unique: true
  end
end
