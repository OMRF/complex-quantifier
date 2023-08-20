import { csvParse } from 'd3';
import { readCSV } from 'danfojs';

const NORMALIZING_PROTEIN_CONCENTRATION = 8;
const NORMALIZING_PROTEIN = 'Bsa';

const calcGeoMean = (x: number[]): number => {
	x = x.filter((value) => value > 0);
	return Math.exp(x.reduce((sum, value) => sum + Math.log(value), 0) / x.length);
};

export const handle = async (file: File) => {
	let df = await readCSV(file);
	// We rename the columns to be equal to the row 2 sample IDs:
	const newColumnNames = (df.values[1] as string[]).slice(3);
	let newColumnMappings: {
		[key: string]: string;
	} = {};

	df.columns.slice(3).forEach((name, i) => {
		newColumnMappings[name] = newColumnNames[i];
	});

	await df.rename(newColumnMappings, { inplace: true });

    // We remove rows 1-12 and remove null rows, keeping only the data
	const rowsToDrop = Array.from({ length: 12 }, (_, index) => index)

	df.values.forEach((_row, index) => {
		const row = _row as (string | number)[];
		if (row.length !== df.columns.length) {
			rowsToDrop.push(index);
		}
	})

	df = df.drop({ index: rowsToDrop });

	// cast all values to numbers. THIS FIXES THE COLUMN DATA LENGTH MISMATCH!!
	// the "inplace" boolean in the options parameter DOES NOT WORK. You have to reassign the dataframe by doing df = ...
	df.columns.slice(2).forEach((column) => {
		df = df.asType(column, 'float32');
	});

    const proteinGroups = df.groupby(['Protein'])

	proteinGroups.agg({[df.columns[3]]: 'mean'}).print()

    debugger
};
