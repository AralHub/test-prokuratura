import { Flex, Image, Typography } from "antd"
import type { FC } from "react"

interface LogoProps {
	theme?: "dark" | "light"
	size?: "small" | "medium" | "large"
	collapsed?: boolean
}

const Logo: FC<LogoProps> = ({ theme, size = "medium", collapsed }) => {
	return (
		<>
			<Flex gap={8} align={"center"}>
				<Image
					width={size === "small" ? 36 : size === "medium" ? 48 : 64}
					height={size === "small" ? 36 : size === "medium" ? 48 : 64}
					src={"/pro-logo.png"}
					fallback={"/public/pro-logo.png"}
					preview={false}
				/>
				<div hidden={collapsed}>
					<Typography.Title
						level={size === "small" ? 4 : size === "medium" ? 3 : 2}
						style={{
							color: theme === "dark" ? "#fff" : undefined,
							lineHeight: 1,
							marginBottom: size === "small" ? 4 : size === "medium" ? 8 : 12
						}}
					>
						Prokuratura
					</Typography.Title>
					<Typography.Paragraph
						hidden={collapsed}
						// level={size === "small" ? 4 : size === "medium" ? 3 : 2}
						style={{
							color: theme === "dark" ? "#fff" : undefined,
							lineHeight: 1
						}}
					>
						Test platform
					</Typography.Paragraph>
				</div>
			</Flex>
		</>
	)
}

export { Logo }
