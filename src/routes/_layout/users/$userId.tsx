import { createFileRoute } from "@tanstack/react-router"
import { Badge, Card, Empty, Flex, Select, Space, Spin } from "antd"
import { css, cx, useResponsive } from "antd-style"
import { useEffect, useRef, useState } from "react"
import { useGetExamsListByUserId } from "src/entities/exams"
import { useGetUsersById, useGetUsersByIdAnswers } from "src/entities/users"
import { QuestionNav } from "src/pages/tests/ui/question-nav"
import { useToken } from "src/shared/hooks"
import { PageHeader } from "src/widgets/page-header"

export const Route = createFileRoute("/_layout/users/$userId")({
	component: RouteComponent
})

// const questionList: Questions[] = Array.from({ length: 30 }, (_v, index) => ({
// 	id: index + 1,
// 	options: [
// 		{
// 			id: 1,
// 			text: "Hello 1",
// 			is_correct: false
// 		},
// 		{
// 			id: 2,
// 			text: "Hello 2",
// 			is_correct: false
// 		},
// 		{
// 			id: 3,
// 			text: "Hello 3",
// 			is_correct: true
// 		},
// 		{
// 			id: 4,
// 			text: "Hello 4",
// 			is_correct: false
// 		}
// 	],
// 	text: `hello ${index + 1}?`
// }))

function RouteComponent() {
	const { userId } = Route.useParams()
	const { mobile } = useResponsive()
	const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
	const {
		token: { colorWhite }
	} = useToken()
	const [exam, setExam] = useState<string>()

	const { data: user, isLoading } = useGetUsersById(userId)
	const {
		data: userAnswers,
		isLoading: userAnswersLoading,
		isFetching: userAnswersFetching
	} = useGetUsersByIdAnswers(userId, {
		exam_id: exam?.split("_")?.at(0),
		user_attempt_uuid: exam?.split("_")?.at(1)
	})
	const { data: exams, isLoading: examsLoading } =
		useGetExamsListByUserId(userId)

	const handleClick = (key: string) => {
		const ref = sectionRefs.current[key]
		ref?.scrollIntoView({ behavior: "smooth", block: "start" })
	}

	useEffect(() => {
		if (exams && exams.data) {
			const [current] = exams.data
			setExam(`${current?.id}_${current?.user_attempt_uuid}`)
		}
	}, [exams])
	return (
		<>
			<PageHeader
				noSpace={true}
				showBack={true}
				title={"Результат: " + (isLoading ? "Загрузка..." : user?.data?.name)}
				extra={
					<Select
						size={"large"}
						style={
							mobile
								? {
										width: "100%",
										minWidth: 100
									}
								: {
										width: "50%",
										minWidth: 100
									}
						}
						placeholder={"Выберите предмет"}
						loading={examsLoading}
						value={exam}
						onChange={setExam}
						disabled={examsLoading}
						options={exams?.data?.map((el, index) => ({
							value: `${el?.id}_${el.user_attempt_uuid}`,
							label: el.title + " (" + (index + 1) + ")"
						}))}
					/>
				}
			/>
			<Flex
				style={{
					width: "100%",
					padding: mobile ? "20px 0px" : "24px 0px"
				}}
				justify="center"
				gap={48}
			>
				{userAnswersLoading || userAnswersFetching ? (
					<Spin spinning={userAnswersLoading || userAnswersFetching}>
						<div style={{ height: 300, width: "100%" }}></div>
					</Spin>
				) : (
					<>
						<Flex
							vertical={true}
							gap={16}
							style={{
								width: "100%"
							}}
						>
							{userAnswers?.data?.length ? (
								userAnswers?.data?.map((item, index) => (
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
												{index + 1}. {item.question_text}
											</span>
										}
										key={index}
										ref={(el) => (sectionRefs.current[item.question_id] = el)}
										style={{
											width: "100%",
											backgroundColor: colorWhite
										}}
										styles={{
											body: { padding: mobile ? "8px 12px" : "16px 24px" }
										}}
									>
										{/* {item.image_url && (
								<Flex justify="center">
									<Image
										width={200}
										height={200}
										src={item.image_url}
										style={{ padding: "20px 0px" }}
									/>
								</Flex>
							)} */}
										<Space direction={"vertical"}>
											{item.options.map((el, index) => (
												<Badge
													key={index}
													status={
														item.selected_option_id === el.option_id
															? item.is_correct
																? "success"
																: "error"
															: "default"
													}
													styles={{
														indicator: {
															width: 16,
															height: 16
														}
													}}
													text={el.option_text}
												/>
											))}
										</Space>
									</Card>
								))
							) : (
								<>
									<Empty />
								</>
							)}
						</Flex>
						{!mobile && (
							<QuestionNav
								questionIds={
									userAnswers?.data?.map((q) => String(q.question_id)) || []
								}
								onSelect={handleClick}
								testValues={
									userAnswers?.data.map((item) => String(item.question_id)) ||
									[]
								}
								successValues={
									userAnswers?.data
										?.filter((el) => el.is_correct)
										.map((item) => String(item.question_id)) || []
								}
								errorValues={
									userAnswers?.data
										?.filter((el) => !el.is_correct)
										.map((item) => String(item.question_id)) || []
								}
							/>
						)}
					</>
				)}
			</Flex>
		</>
	)
}
