import { useQueryClient } from "@tanstack/react-query"
import { App, Button, Flex, Modal, Select, Space } from "antd"
import { useCallback, useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import { useCreateUsersPhotoMutation } from "src/entities/users/api/users.api"
import { useGetMeQuery } from "src/features/auth/api/api"

type Props = {
	open: boolean
	onCancel: () => void
	onSuccess: () => void
}

export const PhotoCaptureModal = ({ open, onCancel, onSuccess }: Props) => {
	const webcamRef = useRef<Webcam>(null)
	const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
	const [deviceId, setDeviceId] = useState<string>("")
	const [imageSrc, setImageSrc] = useState<string | null>(null)
	const { data: user } = useGetMeQuery()
	const { mutateAsync: uploadPhoto, isPending } = useCreateUsersPhotoMutation()
	const { message } = App.useApp()
	const queryClient = useQueryClient()

	const handleDevices = useCallback(
		(mediaDevices: MediaDeviceInfo[]) => {
			const videoDevices = mediaDevices.filter(({ kind }) => kind === "videoinput")
			setDevices(videoDevices)
			if (videoDevices.length > 0 && !deviceId) {
				setDeviceId(videoDevices[0].deviceId)
			}
		},
		[deviceId]
	)

	useEffect(() => {
		if (open) {
			navigator.mediaDevices.enumerateDevices().then(handleDevices)
		} else {
			setImageSrc(null)
			setDeviceId("")
		}
	}, [handleDevices, open])

	const capture = useCallback(() => {
		const image = webcamRef.current?.getScreenshot()
		if (image) {
			setImageSrc(image)
		}
	}, [webcamRef])

	const retake = () => {
		setImageSrc(null)
	}

	const handleUpload = async () => {
		if (!imageSrc || !user?.data?.id) return

		try {
			// Convert base64 to Blob
			const res = await fetch(imageSrc)
			const blob = await res.blob()

			const formData = new FormData()
			formData.append("photo", blob, "snapshot.jpg")

			await uploadPhoto({
				id: user.data.id,
				formData
			})

			await queryClient.invalidateQueries({ queryKey: ["auth"] })
			onSuccess()
		} catch {
			message.error("Ошибка при загрузке фото")
		}
	}

	return (
		<Modal
			title="Сделать снимок перед тестом"
			open={open}
			onCancel={onCancel}
			maskClosable={false}
			keyboard={false}
			footer={null}
			destroyOnClose={true}
		>
			<Flex vertical={true} gap={16} align="center">
				{devices.length > 1 && !imageSrc && (
					<Select
						style={{ width: "100%" }}
						value={deviceId}
						onChange={(val) => setDeviceId(val)}
						options={devices.map((device) => ({
							label: device.label || `Camera ${device.deviceId}`,
							value: device.deviceId
						}))}
					/>
				)}

				{!imageSrc ? (
					<Webcam
						audio={false}
						ref={webcamRef}
						videoConstraints={{ deviceId: deviceId ? { exact: deviceId } : undefined }}
						screenshotFormat="image/jpeg"
						style={{ width: "100%", borderRadius: 8 }}
					/>
				) : (
					<img src={imageSrc} alt="Снимок" style={{ width: "100%", borderRadius: 8 }} />
				)}

				{!imageSrc ? (
					<Button type="primary" onClick={capture} block={true} size="large">
						Сделать снимок
					</Button>
				) : (
					<Space style={{ width: "100%", justifyContent: "center" }}>
						<Button onClick={retake} size="large">
							Переснять
						</Button>
						<Button
							type="primary"
							loading={isPending}
							onClick={handleUpload}
							size="large"
						>
							Продолжить
						</Button>
					</Space>
				)}
			</Flex>
		</Modal>
	)
}
