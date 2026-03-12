import { ArrowRightOutlined, UserOutlined } from "@ant-design/icons"
import { Link } from "@tanstack/react-router"
import {
	Avatar,
	Button,
	Card,
	Flex,
	Image,
	List,
	Progress,
	Typography
} from "antd"
import { useResponsive } from "antd-style"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import { useGetUsersList } from "src/entities/users"
import { BASE_URL } from "src/shared/config"
import { ReloadButton } from "src/shared/ui"
import { PageHeader } from "src/widgets/page-header"

// Подключаем плагин один раз в файле
dayjs.extend(duration)

const formatDatesDiff = (
	startDate: string | Date | dayjs.Dayjs,
	endDate: string | Date | dayjs.Dayjs
): string => {
	if (!startDate || !endDate) return "00:00:00"
	const diff = dayjs(endDate).diff(dayjs(startDate))
	const d = dayjs.duration(diff)
	const hours = Math.floor(d.asHours()).toString().padStart(2, "0")
	const minutes = d.minutes().toString().padStart(2, "0")
	const seconds = d.seconds().toString().padStart(2, "0")
	return `${hours}:${minutes}:${seconds}`
}

export const UsersPage = () => {
	const { data: users, isLoading, isFetching, refetch } = useGetUsersList()
	const { xs } = useResponsive()
	return (
		<>
			<PageHeader
				title={"Результаты"}
				extra={
					<ReloadButton
						loading={isFetching}
						onReload={refetch}
						children={"Обновить"}
					/>
				}
			/>
			<List
				loading={isLoading}
				split={false}
				dataSource={users?.data}
				renderItem={(item, index) => {

					return (
						<List.Item key={index}>
							<Card
								style={{ width: "100%" }}
								title={
									<>
										<Avatar
											icon={<UserOutlined />}
											size={"large"}
											src={
												item?.photo_url ? (
													<Image
														width={40}
														height={40}
														src={BASE_URL + item?.photo_url}
														style={{ height: "inherit", objectFit: "cover" }}
													/>
												) : null
											}
										/>{" "}
										{item?.name}
									</>
								}
								extra={
									<Link
										to={"/users/$userId"}
										params={{
											userId: `${item?.id}`
										}}
									>
										<Button
											icon={<ArrowRightOutlined />}
											iconPosition={"end"}
											type="primary"
										>
											{xs ? "" : "Результаты"}
										</Button>
									</Link>
								}
							>
								<List
									dataSource={item.exams}
									renderItem={(childItem, index) => {
										const percent = Math.round(
											(childItem?.total_score * 100) /
												childItem?.questions_count
										)
										return (
											<List.Item key={index}>
												<Flex
													justify={"space-between"}
													style={{ width: "100%" }}
												>
													<div>
														<Typography.Title level={5}>
															{childItem.title}
														</Typography.Title>
														<Typography.Paragraph type={"secondary"}>
															Время: {formatDatesDiff(childItem?.started_at, childItem?.ended_at)}
														</Typography.Paragraph>
													</div>
													<Progress
														size={"small"}
														status={
															percent === 0
																? "exception"
																: percent === 100
																	? "success"
																	: "normal"
														}
														percent={percent}
														format={() =>
															`${childItem?.total_score}/${childItem?.questions_count}`
														}
														type={"circle"}
													/>
												</Flex>
											</List.Item>
										)
									}}
								/>
							</Card>
						</List.Item>
					)
				}}
			/>
		</>
	)
}
