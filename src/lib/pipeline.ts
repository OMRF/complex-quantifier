import process from '$lib/processor'

interface Payload {
    inputFile: File
    BSAConcentration: number
    groups: { name: string, columns: string }[]
    shouldSaveAutomatically: boolean
    saveDirectory: FileSystemDirectoryHandle | null
    fileNamePattern: string
}

const pipeThroughProcessor = async (payload: Payload) => {
}

export default pipeThroughProcessor