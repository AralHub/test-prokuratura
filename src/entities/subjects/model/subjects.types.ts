export type Subject = {
	id: number
	name: string
	description: string
	questions_count: number
}

export type SubjectChange = {
	id?: number | string
	name: string
	description: string
}
export type SubjectsQuestionFile = {
	subject_id?: number | string
	file: File
}
