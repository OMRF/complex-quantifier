import { Workbook, type Worksheet } from 'exceljs'

type Header = string
type Headers = Header[]
type Row = (null | string | number)[]
type Rows = Row[]
type DataFrame = {
    headers: Headers
    rows: Rows
}

/* Naming convention
 * - df: DataFrame
 * - a variable ending with Matrix contains only numbers and have the protein names or any other metadata removed
 */

const process = async (
    file: File,
    normalizingProteinConcentration: number,
    groups: { name: string; columns: number[] }[]
) => {
    let df = await parseCSV(file)
    df = overwriteHeadersAndCleanupData(df)

    const proteinGroups = getGroupsByColumn(df, 'Protein')
    const geometricMeans = getProteinGroupsGeometricMeans(proteinGroups)

    df = { headers: df.headers, rows: geometricMeans }

    const BSAValues = df.rows.find(row => row[0]?.toString().toLowerCase() === 'bsa')!
    const BSAValuesMatrix = BSAValues!.slice(1) as number[] // excludes the protein name
    const geometricMeansMatrix = df.rows.map(row => row.slice(1)) as number[][] // excludes the protein names
    const geoMeansDividedByBSAValuesMatrix = geometricMeansMatrix.map(row =>
        row.map((value, colIndex) => value / BSAValuesMatrix[colIndex])
    )
    const normalizedMatrix = geoMeansDividedByBSAValuesMatrix.map(row =>
        row.map(value => value * normalizingProteinConcentration)
    )
    const normalizedWithProteinNames = normalizedMatrix.map((row, index) => [df.rows[index][0], ...row])

    df = {
        headers: [df.headers[0], ...df.headers.slice(3)],
        rows: normalizedWithProteinNames,
    }

    return createExcelWorkbook(df, groups)
}

export default process

const parseCSV = async (file: File): Promise<DataFrame> => {
    const contents = (await file.text()).trim()
    const lines = contents.split('\n')

    const headers = lines[0].split(',')
    const rows = lines
        .slice(1)
        .map(line => line.split(','))
        .map(row => {
            return row.map(val => {
                // if the value is an empty string, return null
                if (val === '') {
                    return null
                }
                // We want to convert any numbers into the number **type** instead of string so we can perform calculations
                const num = Number(val)
                if (isNaN(num)) {
                    return val
                }
                return num
            })
        })

    return { headers, rows }
}

const convertToCSVFormat = (df: DataFrame) => {
    const headers = df.headers.join(',')
    const rows = df.rows.map(row => row.join(',')).join('\n')

    return headers + '\n' + rows
}

const downloadContents = (contents: string, mimeType: string, fileName: string) => {
    const blob = new Blob([contents], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
}

const overwriteHeadersAndCleanupData = ({ headers: oldHeaders, rows: oldRows }: DataFrame): DataFrame => {
    // Keep the first 3 headers and append the rest of the columns from the 2nd row
    const headers = [...oldHeaders.slice(0, 3), ...oldRows[1].slice(3)] as Headers

    // Remove the first 12 rows
    const rows = oldRows.slice(12)

    return { headers, rows }
}

type Groups = {
    [key: string]: Rows
}

/*
 * Groups the rows by same values in the specified column
 *
 * Example:
 * const df = {
 *  headers: ['Protein', 'Sample1', 'Sample2', 'Sample3'],
 * 	rows: [
 * 		['Protein1', 1, 2, 3],
 * 		['Protein1', 4, 5, 6],
 * 		['Protein2', 7, 8, 9],
 * 		['Protein2', 10, 11, 12],
 * 	]
 * }
 *
 * getGroupsByColumn(df, 'Protein')
 * // returns
 * {
 * 	'Protein1': [
 * 		['Protein1', 1, 2, 3],
 * 		['Protein1', 4, 5, 6],
 * 	],
 * 	'Protein2': [
 * 		['Protein2', 7, 8, 9],
 * 		['Protein2', 10, 11, 12],
 * 	]
 * }
 */
const getGroupsByColumn = ({ headers, rows }: DataFrame, columnName: string): Groups => {
    const columnIndex = headers.indexOf(columnName)
    const groups: Groups = {}

    rows.forEach(row => {
        const key = row[columnIndex] as string
        if (!groups[key]) {
            groups[key] = []
        }
        groups[key].push(row)
    })

    return groups
}

const calcGeometricMean = (x: number[]): number => {
    x = x.filter(value => value > 0)
    return Math.exp(x.reduce((sum, value) => sum + Math.log(value), 0) / x.length)
}

const getProteinGroupsGeometricMeans = (groups: Groups): Rows => {
    const geometricMeans: Rows = []

    for (const [protein, rows] of Object.entries(groups)) {
        const row: Row = [protein]

        for (let i = 3, max = rows[0].length; i < max; i++) {
            const values = rows.map(row => row[i]) as number[]
            row.push(calcGeometricMean(values))
        }

        geometricMeans.push(row)
    }

    return geometricMeans
}

// write a function that converts column index to column letter (excel style). make it handle over 26 columns
const columnIndexToLetter = (index: number): string => {
    let columnLetter = '';
    while (index >= 0) {
      columnLetter = String.fromCharCode(index % 26 + 65) + columnLetter;
      index = Math.floor(index / 26) - 1;
    }
    return columnLetter;
}

const addStatistics = (
    df: DataFrame,
    worksheet: Worksheet,
    skipCols: number,
    skipRows: number,
    shouldCalculateAveragesAndStd: boolean // if this is true, add the AVERAGE and STDEV formulas to the sums row
) => {
    // add empty whitespace row
    if (shouldCalculateAveragesAndStd) {
        worksheet.addRow([...Array.from({ length: df.headers.length + 2 }).fill(null), 'AVG', 'SD'])
    } else {
        worksheet.addRow(Array.from({ length: df.headers.length }).fill(null))
    }

    // add the SUM formula to the end of each column and also convert header number to column letter
    let statisticsRow = Array.from({ length: shouldCalculateAveragesAndStd ? df.headers.length + 2 : df.headers.length }).fill(null)
    statisticsRow[0] = 'Sum'
    for (let i = skipCols, max = df.headers.length; i < max; i++) {
        statisticsRow[i] = {
            formula: `SUM(${columnIndexToLetter(i)}${2 + skipRows}:${columnIndexToLetter(i)}${df.rows.length + 1})`,
        }
    }

    if (shouldCalculateAveragesAndStd) {
        const sumsSelector = `${columnIndexToLetter(skipCols)}${df.rows.length + 3}:${columnIndexToLetter(df.headers.length - 1)}${df.rows.length + 3}`

        statisticsRow = [...statisticsRow, {
            formula: `AVERAGE(${sumsSelector})`
        }, {
            formula: `STDEV(${sumsSelector})`
        }]
    }

    worksheet.addRow(statisticsRow)


    return worksheet
}

const createExcelWorkbook = (df: DataFrame, groups: { name: string; columns: number[] }[]) => {
    const workbook = new Workbook()

    df.rows = [Array.from({ length: df.headers.length }).fill(null) as Row, ...df.rows] // add empty row to space out the data from the headers

    groups.forEach(group => {
        const worksheet = workbook.addWorksheet(group.name)

        const headers = df.headers.filter((_, index) => index === 0 || group.columns.includes(index))
        worksheet.addRow(headers)

        const rows = df.rows.map(row => row.filter((_, index) => index === 0 || group.columns.includes(index)))
        worksheet.addRows(rows)

        addStatistics({ headers, rows }, worksheet, 1, 2, true)
    })

    // add all data to a separate worksheet
    const allDataWorksheet = workbook.addWorksheet('All data')
    allDataWorksheet.addRow(df.headers)
    allDataWorksheet.addRows(df.rows)

    addStatistics(df, allDataWorksheet, 1, 2, false)

    return workbook
}
