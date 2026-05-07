export type Users = {
	id: number
	name: string
	photo_url: string | null
	exams: {
		id: number
		title: string
		total_score: number
		total_time: number
		questions_count: number
		started_at: string
		ended_at: string
	}[]
}

export type UserChange = {
	id?: number | string
	name?: string
	admin_id?: number
	is_active?: boolean
}

export type UserAnswer = {
	question_id: number
	question_text: string
	selected_option_id: number[]
	is_correct: boolean
	options: {
		option_id: number
		option_text: string
	}[]
}
