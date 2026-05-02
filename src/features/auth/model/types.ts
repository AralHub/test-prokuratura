import type { Role } from "src/shared/api"

export type RegisterFormType = {
	name: string
	phone_number: string
	admin_id: number
	password: string
}

export type VerifyFormType = {
	phone_number: string
	code: string
}

export type LoginFormType = {
	phone_number: string
	password: string
}

export type LogoutChange = {
	refresh_token?: string | null
}

export type User = {
  id: number
	name: string
	phone_number: string
	role: Role
	
  is_verified: boolean
  is_active: boolean
  photo_url: string
}
