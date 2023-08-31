import process from '$lib/processor'
import { Workbook } from 'exceljs'

interface Payload {
    inputFile: File
    BSAConcentration: number
    groups: { name: string, columns: string }[]
    shouldSaveAutomatically: boolean
    saveDirectory: FileSystemDirectoryHandle | null
    fileNamePattern: string
}

const pipeThroughProcessor = async (payload: Payload) => {
    const groups = payload.groups.map(group => {
        return {
            name: group.name,
            columns: group.columns.split(',').map(col => Number(col))
        }
    })

    debugger

    const workbook = await process(payload.inputFile, payload.BSAConcentration, groups)

    if (payload.shouldSaveAutomatically) {
        const fileHandle = await payload.saveDirectory!.getFileHandle('test.xlsx', { create: true })
        const writableFile = await fileHandle.createWritable()

        // @ts-expect-error: It works but the types are wrong
        await workbook.xlsx.write(writableFile)

        await writableFile.close()
    }
}

export default pipeThroughProcessor