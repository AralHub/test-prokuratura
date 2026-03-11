import { useNavigate, useParams } from "@tanstack/react-router"
import type { RadioChangeEvent } from "antd"
import { App, Button, Card, Flex, Radio, Image, Skeleton } from "antd"
import { useEffect, useMemo, useRef, useState } from "react"
import { useFinishTest, type Answer } from "src/entities/exams"
import { useGetQuestionsList } from "src/entities/questions"
import { TestResult } from "./test-result"
import { useToken } from "src/shared/hooks"
import { Timer } from "./timer"
import { QuestionNav } from "./question-nav"
import { css, cx, useResponsive } from "antd-style"
import { useGetMeQuery } from "src/features/auth/api/api"

const { useApp } = App

export const Test = () => {
	const { testId } = useParams({ strict: false })
	const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
	const navigate = useNavigate()
	const [testValues, setTestValues] = useState<Answer[]>([])
	const {
		token: { colorWhite }
	} = useToken()
	const { modal } = useApp()
	const { data: questions, isLoading, isFetching } = useGetQuestionsList(testId)
	const { mutate: finish, data: result, isSuccess, isPending } = useFinishTest()
	const { mobile } = useResponsive()
	const onChangeVariant = ({ question_id, option_id }: Answer) => {
		setTestValues((prev) => [
			...prev.filter((val) => val.question_id !== question_id),
			{ question_id, option_id }
		])
	}
		const { data: user, isLoading: isUserLoading } = useGetMeQuery()

	const handleClick = (key: string) => {
		const ref = sectionRefs.current[key]
		ref?.scrollIntoView({ behavior: "smooth", block: "start" })
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
				title: <TestResult user={user?.data} total_score={result.data.total_score} />,
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
						started_at={questions?.data?.started_at}
						ended_at={questions?.data?.ended_at}
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
								<Card
									className={cx(css`
										.ant-card-head-title {
											text-overflow: clip;
											white-space: normal;
											padding: 12px 0;
										}
									`)}
									title={
										<span>
											{index + 1}. {item.text}
										</span>
									}
									key={item.id}
									ref={(el) => (sectionRefs.current[item.id] = el)}
									style={{
										width: "100%",
										backgroundColor: colorWhite
									}}
									styles={{
										body: { padding: mobile ? "8px 12px" : "16px 24px" }
									}}
								>
									{item.image_url && (
										<Flex justify="center">
											<Image
												width={200}
												height={200}
												src={item.image_url}
												style={{ padding: "20px 0px" }}
											/>
										</Flex>
									)}
									<Radio.Group
										onChange={({ target: { value } }: RadioChangeEvent) => {
											onChangeVariant({
												question_id: item.id,
												option_id: value
											})
										}}
										name={`test-${item.id}`}
										options={item.options.map((variant) => ({
											label: variant.text,
											value: variant.id
										}))}
										style={{
											display: "flex",
											flexDirection: "column",
											gap: 8
										}}
										defaultValue={null}
									/>
								</Card>
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
