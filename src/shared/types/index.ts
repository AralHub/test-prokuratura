export type IdName = {
	id: number
	name: string
}

export type TranslateName = {
	ru: string
	en: string
	uz: string
	kk: string
}

export type TranslateKeys = keyof TranslateName

export type GetParams = {
	page?: number
	page_size?: number
	search?: string
	most_correct?: string | boolean | number
	exam_id?: string | number
	user_attempt_uuid?: string
	name?: string
}

export type ParamId = number | string | null | undefined
