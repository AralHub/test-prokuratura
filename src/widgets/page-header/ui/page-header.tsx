import { ArrowLeftOutlined } from "@ant-design/icons"
import { useRouter } from "@tanstack/react-router"
import type { BreadcrumbProps} from "antd"
import { Breadcrumb, Flex, Space, Typography } from "antd"
import { useResponsive } from "antd-style"
import type { FC, ReactNode } from "react"

interface PageHeaderProps {
	title?: string
	subtitle?: string
	extra?: ReactNode
	breadcrumb?: BreadcrumbProps["items"]
	showBack?: boolean
	noSpace?: boolean
}

const PageHeader: FC<PageHeaderProps> = ({
	title,
	breadcrumb,
	extra,
	noSpace,
	showBack,
	subtitle
}) => {
	const { xs } = useResponsive()
	const { history } = useRouter()

	const subtitleComp = subtitle ? (
		<Typography.Paragraph>{subtitle}</Typography.Paragraph>
	) : null

	const titleComp = title ? (
		<Typography.Title level={xs ? 4 : 3} style={{ display: "flex" }}>
			{showBack ? (
				<ArrowLeftOutlined
					style={{ marginRight: 20 }}
					onClick={() => history.back()}
				/>
			) : null}
			{subtitleComp ? (
				<div>
					{title}
					{subtitleComp}
				</div>
			) : (
				title
			)}
		</Typography.Title>
	) : null

	const extraComp = extra ? (
		noSpace ? (
			extra
		) : (
			<Space wrap={true}>{extra}</Space>
		)
	) : null
	const breadcrumbComp = breadcrumb ? <Breadcrumb items={breadcrumb} /> : null

	return (
		<>
			<Flex justify={"space-between"} align={"center"} wrap={true} gap={8}>
				{breadcrumbComp ? (
					<div>
						{titleComp}
						{breadcrumbComp}
					</div>
				) : (
					titleComp
				)}
				{extraComp ? extraComp : breadcrumbComp}
			</Flex>
		</>
	)
}

export { PageHeader }
