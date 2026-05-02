import { useNavigate, useParams } from "@tanstack/react-router"
import { App, Button, Flex, Skeleton } from "antd"
import { useResponsive } from "antd-style"
import { useEffect, useMemo, useRef, useState } from "react"
import { useFinishTest, type Answer } from "src/entities/exams"
import { useGetQuestionsList } from "src/entities/questions"
import { useGetMeQuery } from "src/features/auth/api/api"
import { QuestionNav } from "./question-nav"
import { TestItem } from "./test-item"
import { TestResult } from "./test-result"
import { Timer } from "./timer"

const { useApp } = App

export const Test = () => {
	const { testId } = useParams({ strict: false })
	const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
	const navigate = useNavigate()
	const [testValues, setTestValues] = useState<Answer[]>([])
	const { modal } = useApp()
	const { data: questions, isLoading, isFetching } = useGetQuestionsList(testId)
	const { mutate: finish, data: result, isSuccess, isPending } = useFinishTest()
	const { mobile } = useResponsive()

	const onChangeVariant = (answer: Answer) => {
		setTestValues((prev) => [
			...prev.filter((val) => val.question_id !== answer.question_id),
			answer
		])
	}
	const { data: user, isLoading: isUserLoading } = useGetMeQuery()

	const handleClick = (key: string) => {
		const ref = sectionRefs.current[key]
		ref?.scrollIntoView({ behavior: "smooth", block: "center", })
	}

	const onFinishedTest = () => {
		finish({ answers: testValues, exam_id: testId! })
	}

	const questionList = useMemo(
		() => questions?.data?.questions ?? [],
		[questions?.data?.questions]
	)

	useEffect(() => {
		if (isSuccess) {
			modal.success({
				title: (
					<TestResult user={user?.data} total_score={result.data.total_score} />
				),
				maskClosable: false,
				onOk: () => {
					navigate({ to: "/tests", replace: true })
				}
			})
		}
	}, [isSuccess, modal, navigate, result?.data.total_score, user])
	return (
		<>
			{isLoading || isFetching || isUserLoading ? (
				<Skeleton
					loading={isLoading || isFetching}
					active={true}
					paragraph={{
						rows: 10
					}}
				/>
			) : (
				<>
					<Timer
						startedAt={questions?.data?.started_at}
						endedAt={questions?.data?.ended_at}
						onFinish={onFinishedTest}
					/>
					<Flex
						style={{
							width: "100%",
							padding: mobile ? "20px 0px" : "24px 0px"
						}}
						justify="center"
						gap={24}
					>
						<Flex
							vertical={true}
							gap={16}
							style={{
								width: "100%"
							}}
						>
							{questionList.map((item, index) => (
								<TestItem
									data={item}
									key={index + 1}
									dataKey={index + 1}
									onChangeVariant={onChangeVariant}
									ref={(el) => (sectionRefs.current[item.id] = el)}
								/>
							))}
							<Button
								type="primary"
								onClick={onFinishedTest}
								loading={isPending}
							>
								Завершить тест
							</Button>
						</Flex>
						{!mobile && (
							<QuestionNav
								questionIds={questionList.map((q) => String(q.id))}
								onSelect={handleClick}
								testValues={testValues.map((item) => String(item.question_id))}
							/>
						)}
					</Flex>
				</>
			)}
		</>
	)
}
