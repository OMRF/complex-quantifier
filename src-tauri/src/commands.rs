use serde::Deserialize;
use tauri::api::dialog::blocking::FileDialogBuilder;
use crate::calculator::{calc_protein_geometric_means, normalize_protein_abundances};
use crate::parser::parse;
use crate::writer::write;

pub type GroupName = String;

#[derive(Debug, Deserialize)]
pub struct UnprocessedGroup {
    pub name: GroupName,
    pub columns: Vec<String>,
}

#[tauri::command]
pub async fn process_data(
    normalizing_protein: String,
    normalizing_protein_conc: f64,
    groups: Vec<UnprocessedGroup>,
) -> Result<(), String> {
    let input_file_path = match FileDialogBuilder::new()
        .add_filter("CSV Files", &["csv"])
        .pick_file()
    {
        Some(file_path) => file_path,
        None => return Ok(()),
    };

    let (proteins, mice, groups) = parse(groups, &input_file_path).await.map_err(|e| e.to_string())?;
    let calculations = calc_protein_geometric_means(proteins, mice.clone());
    let normalized_calculations = normalize_protein_abundances(normalizing_protein, normalizing_protein_conc, calculations).map_err(|e| e.to_string())?;

    let input_file_name = input_file_path.file_name().unwrap().to_string_lossy().split('.').next().unwrap().to_string();

    let save_file_path = match FileDialogBuilder::new()
        .set_file_name(&format!("{}_quantified.xlsx", input_file_name))
        .save_file()
    {
        Some(file_path) => file_path,
        None => return Ok(()),
    };

    write(&save_file_path, mice, normalized_calculations, groups).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn process_data_bulk(
    normalizing_protein: String,
    normalizing_protein_conc: f64,
) -> Result<(), String> {
    let input_files = match FileDialogBuilder::new()
        .add_filter("CSV Files", &["csv"])
        .pick_files()
    {
        Some(file_paths) => file_paths,
        None => return Ok(()),
    };

    for file in input_files {
        let (proteins, mice, groups) = parse(vec![], &file).await.map_err(|e| e.to_string())?;
        let calculations = calc_protein_geometric_means(proteins, mice.clone());
        let normalized_calculations = normalize_protein_abundances(normalizing_protein.clone(), normalizing_protein_conc, calculations).map_err(|e| e.to_string())?;

        let file_name = format!("{}_quantified.xlsx", file.file_name().unwrap().to_string_lossy().split('.').next().unwrap().to_string());
        let save_file_path = file.parent().unwrap().join(file_name);

        write(&save_file_path, mice, normalized_calculations, groups).map_err(|e| e.to_string())?;
    }


    Ok(())
}