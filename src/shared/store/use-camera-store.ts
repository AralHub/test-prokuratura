import { create } from "zustand"

interface CameraStore {
	isModalOpen: boolean
	setIsModalOpen: (isModalOpen: boolean) => void
}

const useCameraStore = create<CameraStore>()((set) => ({
	isModalOpen: false,
	setIsModalOpen: (isModalOpen: boolean) => set({ isModalOpen })
}))

export { useCameraStore }
