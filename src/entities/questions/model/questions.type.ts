export type QuestionCreate = {
	id?: string | number
	text: string
	options: Variant[]
	subject_id?: number
	question_ids?: number[]

	type?: string
	slots?: {
		variantKey: string
		sequence_order: number
	}[]
}

export type QuestionGenerate = {
	id?: string | number
	count: number
}

export type Variant = {
	id?: number
	text: string
	is_correct?: boolean
}

export type QuestionsData = {
	user_attempt_id: number
	questions: Questions[]
	started_at: string
	ended_at: string
}

export type Questions = {
	id: number
	text: string
	type: "single" | "multiple" | "drag"
	count?: number
	image_url?: string
	options: Variant[]
}

export type AddImage = {
	question_id: number
	image: File
}
