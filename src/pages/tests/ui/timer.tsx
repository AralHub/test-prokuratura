import { Progress, Typography } from "antd"
import React, { useEffect, useRef, useState } from "react"
import { useToken } from "src/shared/hooks"

const { Text } = Typography

type TimerProps = {
	startedAt?: string
	endedAt?: string
	onFinish: () => void
}

export const Timer: React.FC<TimerProps> = ({
	startedAt,
	endedAt,
	onFinish
}) => {
	const {
		token: { colorPrimary }
	} = useToken()

	const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
	const [totalSeconds, setTotalSeconds] = useState<number>(0)
	const hasFinished = useRef(false) // Флаг: было ли завершение уже

	const getTotalSeconds = (start: string, end: string) => {
		const startDate = new Date(start)
		const endDate = new Date(end)
		return Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
	}

	useEffect(() => {
		if (!startedAt || !endedAt) return

		const now = new Date()
		const end = new Date(endedAt)
		const total = getTotalSeconds(startedAt, endedAt)
		const remaining = Math.floor((end.getTime() - now.getTime()) / 1000)

		setTotalSeconds(total)
		setRemainingSeconds(remaining > 0 ? remaining : 0)
	}, [startedAt, endedAt])

	useEffect(() => {
		if (remainingSeconds === null || remainingSeconds === 0) return

		const interval = setInterval(() => {
			setRemainingSeconds((prev) => {
				if (prev === null || prev <= 1) {
					clearInterval(interval)
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => clearInterval(interval)
	}, [remainingSeconds])

	useEffect(() => {
		if (remainingSeconds && remainingSeconds <= 2 && !hasFinished.current) {
			hasFinished.current = true
			onFinish()
		}
	}, [remainingSeconds, onFinish])

	if (!startedAt || !endedAt || remainingSeconds === null) return null

	const percent = (remainingSeconds / totalSeconds) * 100
	const minutes = Math.floor(remainingSeconds / 60)
	const seconds = remainingSeconds % 60

	return (
		<>
			<Progress
				percent={parseFloat(percent.toFixed(1))}
				strokeColor={colorPrimary}
				showInfo={false}
				status={remainingSeconds === 0 ? "success" : "active"}
			/>
			<Text>
				{remainingSeconds === 0
					? "Время истекло"
					: `Осталось: ${minutes}м ${seconds}с`}
			</Text>
		</>
	)
}
