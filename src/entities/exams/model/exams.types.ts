import type { User } from "src/features/auth/model/types"

export type Exam = {
	id?: number
	title: string
	description: string
	time_limit_minutes: number
	is_active: boolean
	total_score?: number
	questions_per_subject: number
	questions_count: number
	passed?: boolean
	is_expired?: boolean

	user_attempt_uuid: string
}

export type ExamChange = {
	id?: number
	title: string
	description: string
	time_limit_minutes: number
	questions_per_subject: number
	subject_ids: number[]
}

export type Stats = {
	user_id: number
	user_name: string
	total_attempts: number
	avg_score_percentage: number
	total_correct_answers: number
	total_wrong_answers: number
	total_questions_faced: number
	unanswered_questions: number
	avg_correct_percentage: number
}

export type Start = {
	user_id: number
	exam_id: number
	started_at: string
	ended_at: string
	id: number
}

export type FinishForm = {
	exam_id: string
	answers: Answer[]
}

export type Answer = {
	question_id: number
	option_id?: number[]
}

export type TestResult = {
	total_score: number
	user?: User
	loading?: boolean
}
