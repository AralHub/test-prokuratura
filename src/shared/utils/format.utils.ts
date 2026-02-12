import dayjs, { type Dayjs } from "dayjs"

export const formatNumber = <T>(value: T, defaultValue: number = 0) => {
	if (isNaN(Number(value))) return defaultValue
	return Number(value) || defaultValue
}

export const formatPhone = (value?: string | null) => {
	if (!value) return ""
	return value.replace(/(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, "+$1 $2 $3 $4 $5")
}

export const formatFormPhone = (phone?: string) => {
	if (!phone) return ""
	if (phone?.startsWith("998")) return phone.split(" ").join("")
	return `998` + phone.split(" ").join("")
}

export const formatFormReversePhone = (phone?: string) => {
	if (!phone) return ""
	return phone?.slice(3)
}

export const formatDate = (value?: string | Dayjs) =>
	dayjs(value).format("YYYY-MM-DD")

export const formatCustomDate = (
	value?: string | Dayjs,
	format: string = "YYYY-MM-DD",
) => dayjs(value).format(format)

export const formatInputPhone = <T>(value?: T) => `${value}`.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4")
