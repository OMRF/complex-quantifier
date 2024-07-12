use std::collections::HashMap;
use std::error::Error;
use std::path::Path;
use rust_xlsxwriter::{column_name_to_number, column_number_to_name, Formula, Workbook};
use crate::commands::{GroupName};
use crate::parser::{FirstIntensityIndex, Group, MouseId, ProteinName};

pub fn write(
    path: &Path,
    ordered_headers: Vec<MouseId>,
    calculations: HashMap<ProteinName, HashMap<MouseId, f64>>,
    groups: Vec<Group>,
) -> Result<(), Box<dyn Error>> {
    let separated_calculations = separate_calc_by_groups(groups, &calculations);

    let mut workbook = Workbook::new();

    write_master_worksheet(&mut workbook, &ordered_headers, &calculations)?;

    for ((group_name, mice), calculations) in separated_calculations {
        write_group(&mut workbook, &ordered_headers, &group_name, &mice, &calculations)?;
    }

    workbook.save(path)?;

    Ok(())
}

fn write_group(
    workbook: &mut Workbook,
    ordered_headers: &Vec<MouseId>,
    name: &GroupName,
    mice: &Vec<MouseId>,
    calculations: &HashMap<ProteinName, HashMap<MouseId, f64>>,
) -> Result<(), Box<dyn Error>> {
    let worksheet = workbook.add_worksheet().set_name(name)?;
    let filtered_headers = ordered_headers
        .iter()
        .filter(|mouse| mice.contains(mouse))
        .map(|mouse| mouse.clone())
        .collect::<Vec<MouseId>>();

    // Write headers
    worksheet.write_string(0, 0, "Protein")?;
    for (index, header) in filtered_headers.iter().enumerate() {
        worksheet.write_string(0, (index + 1) as u16, header)?;
    }

    // Write data
    let mut row = 2; // Edit the formula if you change this value
    for (protein, intensities) in calculations {
        worksheet.write_string(row, 0, protein)?;

        for (mouse, intensity) in intensities {
            let column = ordered_headers.iter().position(|x| x == mouse).unwrap() + 1;
            worksheet.write_number(row, column as u16, *intensity)?;
        }

        row += 1;
    }

    // write sum of columns, excluding header
    worksheet.write_string(row + 1, 0, "Sums")?;
    for (index, _) in filtered_headers.iter().enumerate() {
        let column = (index + 1) as u16;
        let column_letter = column_number_to_name(column);
        let formula = format!("=SUM({column_letter}3:{column_letter}{row})");
        worksheet.write_formula(row + 1, column, Formula::new(formula))?;
    }
    // add average of sums
    let average_col = (filtered_headers.len() + 3) as u16;
    let average_formula = Formula::new(
        format!(
            "=AVERAGE(B{}:{}{})",
            row + 2,
            column_number_to_name(filtered_headers.len() as u16),
            row + 2
        )
    );
    worksheet.write_string(row, average_col, "Average")?;
    worksheet.write_formula(row + 1, average_col, average_formula)?;

    // add standard deviation of sums
    let std_dev_col = (filtered_headers.len() + 4) as u16;
    let std_dev_formula = Formula::new(
        format!(
            "=STDEV(B{}:{}{})",
            row + 2,
            column_number_to_name(filtered_headers.len() as u16),
            row + 2
        )
    );
    worksheet.write_string(row, std_dev_col, "Standard Deviation")?;
    worksheet.write_formula(row + 1, std_dev_col, std_dev_formula)?;


    Ok(())
}

fn write_master_worksheet(
    workbook: &mut Workbook,
    ordered_headers: &Vec<MouseId>,
    calculations: &HashMap<ProteinName, HashMap<MouseId, f64>>,
) -> Result<(), Box<dyn Error>> {
    let worksheet = workbook.add_worksheet().set_name("All Data")?;

    // Write headers
    worksheet.write_string(0, 0, "Protein")?;
    for (index, header) in ordered_headers.iter().enumerate() {
        worksheet.write_string(0, (index + 1) as u16, header)?;
    }

    // Write data
    let mut row = 2; // Edit the formula if you change this value
    for (protein, intensities) in calculations {
        worksheet.write_string(row, 0, protein)?;

        for (mouse, intensity) in intensities {
            let column = ordered_headers.iter().position(|x| x == mouse).unwrap() + 1;
            worksheet.write_number(row, column as u16, *intensity)?;
        }

        row += 1;
    }

    // write sum of columns, excluding header
    worksheet.write_string(row + 1, 0, "Sums")?;
    for (index, _) in ordered_headers.iter().enumerate() {
        let column = (index + 1) as u16;
        let column_letter = column_number_to_name(column);
        let formula = format!("=SUM({column_letter}3:{column_letter}{row})");
        worksheet.write_formula(row + 1, column, Formula::new(formula))?;
    }

    Ok(())
}


fn separate_calc_by_groups(
    groups: Vec<Group>,
    calculations: &HashMap<ProteinName, HashMap<MouseId, f64>>,
) -> HashMap<(GroupName, Vec<MouseId>), HashMap<ProteinName, HashMap<MouseId, f64>>> {
    let mut separated_calculations = HashMap::new();

    for group in groups {
        let mut aggregated_calculations: HashMap<ProteinName, HashMap<MouseId, f64>> = HashMap::new();
        for (protein_name, intensities) in calculations {
            let filtered_intensities: HashMap<MouseId, f64> = intensities
                .iter()
                .filter(|(mouse_id, _)| group.mice.contains(mouse_id))
                .map(|(mouse_id, value)| (mouse_id.clone(), *value))
                .collect();

            aggregated_calculations.insert(protein_name.clone(), filtered_intensities);
        }

        separated_calculations.insert((group.name.clone(), group.mice), aggregated_calculations);
    }

    separated_calculations
}

