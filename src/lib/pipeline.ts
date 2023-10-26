import process from '$lib/processor'
import { save } from '@tauri-apps/api/dialog'
import { writeBinaryFile, BaseDirectory } from '@tauri-apps/api/fs'

interface Payload {
    inputFile: File
    BSAConcentration: number
    groups: { name: string; columns: string }[]
    saveFolderPath: string | null
    filenamePattern: string
}

const pipeThroughProcessor = async (payload: Payload) => {
    const groups = payload.groups.map(group => {
        return {
            name: group.name,
            columns: group.columns.split(',').map(col => Number(col)),
        }
    })

    const workbook = await process(payload.inputFile, payload.BSAConcentration, groups)

    const filename = createFilename(payload.filenamePattern, payload.inputFile) + '.xlsx'

    if (payload.saveFolderPath) {
        const buffer = await workbook.xlsx.writeBuffer()

        await writeBinaryFile(`${payload.saveFolderPath}/${filename}`, buffer)
    } else {
        const filePath = await save({
            filters: [
                {
                    name: 'Complex quantification results',
                    extensions: ['xlsx'],
                },
            ],

            defaultPath: filename,
        })

        if (!filePath) {
            return
        }

        const buffer = await workbook.xlsx.writeBuffer()

        await writeBinaryFile(filePath, buffer)
    }
}

const createFilename = (pattern: string, inputFile: File) => {
    const date = new Date()
    const filename = inputFile.name.split('.').slice(0, -1).join('.')
    const year = String(date.getFullYear())
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return pattern
        .replace(/{filename}/g, filename)
        .replace(/{year}/g, year)
        .replace(/{month}/g, month)
        .replace(/{day}/g, day)
        .replace(/{hours}/g, hours)
        .replace(/{minutes}/g, minutes)
        .replace(/{seconds}/g, seconds)
}

export default pipeThroughProcessor
