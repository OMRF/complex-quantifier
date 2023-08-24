import { DataFrame as DFDataFrame, readCSV } from 'danfojs'

type Header = string
type Headers = Header[]
type Row = (null | string | number)[]
type Rows = Row[]
type DataFrame = {
    headers: Headers
    rows: Rows
}

const NORMALIZING_PROTEIN_CONCENTATION = 8

/* Naming convention
 * - df: DataFrame
 * - a variable ending with Matrix contains only numbers and have the protein names or any other metadata removed
 */

export const handle = async (file: File) => {
    let df = await parseCSV(file)
    df = overwriteHeadersAndCleanupData(df)

    const proteinGroups = getGroupsByColumn(df, 'Protein')
    const geometricMeans = getProteinGroupsGeometricMeans(proteinGroups)

    df = { headers: df.headers, rows: geometricMeans }

    const BSAValues = df.rows.find((row) => row[0]?.toString().toLowerCase() === 'bsa')!
    const BSAValuesMatrix = BSAValues!.slice(1) as number[] // excludes the protein name
    const geometricMeansMatrix = df.rows.map((row) => row.slice(1)) as number[][] // excludes the protein names
    const geoMeansDividedByBSAValuesMatrix = geometricMeansMatrix.map((row) =>
        row.map((value, colIndex) => value / BSAValuesMatrix[colIndex])
    )
    const normalizedMatrix = geoMeansDividedByBSAValuesMatrix.map((row) =>
        row.map((value) => value * NORMALIZING_PROTEIN_CONCENTATION)
    )
    const normalizedWithProteinNames = normalizedMatrix.map((row, index) => [df.rows[index][0], ...row])

    const csv = convertToCSVFormat({
        headers: [df.headers[0], ...df.headers.slice(3)],
        rows: normalizedWithProteinNames,
    })

    downloadContents(csv, 'text/csv', 'normalized.csv')
}

const parseCSV = async (file: File): Promise<DataFrame> => {
    const contents = (await file.text()).trim()
    const lines = contents.split('\n')

    const headers = lines[0].split(',')
    const rows = lines
        .slice(1)
        .map((line) => line.split(','))
        .map((row) => {
            return row.map((val) => {
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
    const rows = df.rows.map((row) => row.join(',')).join('\n')

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

    rows.forEach((row) => {
        const key = row[columnIndex] as string
        if (!groups[key]) {
            groups[key] = []
        }
        groups[key].push(row)
    })

    return groups
}

const calcGeometricMean = (x: number[]): number => {
    x = x.filter((value) => value > 0)
    return Math.exp(x.reduce((sum, value) => sum + Math.log(value), 0) / x.length)
}

const getProteinGroupsGeometricMeans = (groups: Groups): Rows => {
    const geometricMeans: Rows = []

    for (const [protein, rows] of Object.entries(groups)) {
        const row: Row = [protein]

        for (let i = 3, max = rows[0].length; i < max; i++) {
            const values = rows.map((row) => row[i]) as number[]
            row.push(calcGeometricMean(values))
        }

        geometricMeans.push(row)
    }

    return geometricMeans
}

export const oldHandle = async (file: File) => {
    // get the first line of text from file
    const contents = await file.text()
    const lines = contents.split('\n')
    const cols = lines[0].split(',').map((col) => col.toString())
    let df = await readCSV(file, {
        // @ts-expect-error
        header: false,
        columns: cols,
    })
    df.print()
    // We rename the columns to be equal to the row 2 sample IDs:
    const newColumnNames = (df.values[1] as string[]).slice(3)
    let newColumnMappings: {
        [key: string]: string
    } = {}

    df.columns.slice(3).forEach((name, i) => {
        newColumnMappings[name] = newColumnNames[i]
    })

    debugger

    await df.rename(newColumnMappings, { inplace: true })

    // We remove rows 1-12 and remove null rows, keeping only the data
    const rowsToDrop = Array.from({ length: 12 }, (_, index) => index)

    df.values.forEach((_row, index) => {
        const row = _row as (string | number)[]
        if (row.length !== df.columns.length) {
            rowsToDrop.push(index)
        }
    })

    df = df.drop({ index: rowsToDrop })

    // cast all values to numbers. THIS FIXES THE COLUMN DATA LENGTH MISMATCH!!
    // the "inplace" boolean in the options parameter DOES NOT WORK. You have to reassign the dataframe by doing df = ...
    df.columns.slice(2).forEach((column) => {
        df = df.asType(column, 'float32')
    })

    // calculate the geometric mean of each protein
    let proteins = df.groupby(['Protein']).colDict

    const newRows: (string | number)[][] = []

    for (const [protein, _cols] of Object.entries(proteins)) {
        // omit the first 3 columns because they aren't included in the results
        const cols = Object.fromEntries(Object.entries(_cols).slice(3)) as {
            [k: string]: number[]
        }

        const row: (string | number)[] = [protein]

        for (const [header, numbers] of Object.entries(cols)) {
            row.push(calcGeoMean(numbers))
        }

        newRows.push(row)
    }

    df = new DFDataFrame(newRows, { columns: ['Protein', ...newColumnNames] })
}
