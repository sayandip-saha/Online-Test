Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    post "auth/register", to: "auth#register"
    post "auth/login", to: "auth#login"
    get "auth/me", to: "auth#me"

    resources :exam_submissions, only: [:create, :index, :show]

    # Admin portal endpoints
    get "admin/stats", to: "admin#stats"
    get "admin/submissions", to: "admin#submissions"
    get "admin/candidates", to: "admin#candidates"
    post "admin/reset_attempt/:candidate_id", to: "admin#reset_attempt"
    delete "admin/submissions/:id", to: "admin#delete_submission"
    delete "admin/candidates/:id", to: "admin#delete_candidate"
    post "admin/clear_all", to: "admin#clear_all"
  end
end
