use std::collections::HashMap;
use std::error::Error;
use std::fs::File;
use std::io::Cursor;
use std::path::Path;
use csv::ReaderBuilder;
use rust_xlsxwriter::column_name_to_number;
use serde::Deserialize;
use tokio::fs;
use crate::commands::{GroupName, UnprocessedGroup};

pub type ProteinName = String;
pub type Sequence = String;

pub type MouseId = String;

pub type FirstIntensityIndex = i64;

#[derive(Debug, Clone)]
pub struct Protein {
    pub name: ProteinName,
    pub peptides: Vec<Peptide>,
}

#[derive(Debug, Clone)]
pub struct Peptide {
    pub sequence: Sequence,
    pub intensities: Vec<Intensity>,
}

#[derive(Debug, Clone)]
pub struct Intensity {
    pub mouse: MouseId,
    pub value: f64,
}

#[derive(Debug, Deserialize)]
pub struct Group {
    pub name: GroupName,
    pub mice: Vec<MouseId>,
}

pub async fn parse(groups: Vec<UnprocessedGroup>, spreadsheet: &Path) -> Result<(Vec<Protein>, Vec<MouseId>, Vec<Group>), Box<dyn Error>> {
    let mut proteins: HashMap<String, Vec<Peptide>> = HashMap::new();

    let mut rdr = ReaderBuilder::new()
        .from_path(spreadsheet)?;

    let headers = rdr.headers()?.clone();
    let protein_index = headers.iter().position(|x| x.to_lowercase().trim() == "protein").ok_or("Couldn't find protein column")?;
    let peptide_index = headers.iter().position(|x| x.to_lowercase().trim() == "peptide").ok_or("Couldn't find peptide column")?;
    let max_index = std::cmp::max(protein_index, peptide_index);

    for result in rdr.records() {
        let record = result?;

        let protein_name = record[protein_index].to_string();
        let peptide_sequence = record[peptide_index].to_string();

        if (protein_name.is_empty() || peptide_sequence.is_empty()) {
            continue;
        }

        let mut intensities: Vec<Intensity> = vec![];

        for (i, intensity) in record.iter().enumerate().skip(max_index + 1) {
            let mouse = headers[i].to_string();
            let value = intensity.parse::<f64>().map_err(|_| format!("Couldn't parse intensity from mouse {mouse}"))?;

            intensities.push(Intensity { mouse, value });
        }

        let peptide = Peptide {
            sequence: peptide_sequence,
            intensities,
        };

        proteins.entry(protein_name).or_insert_with(Vec::new).push(peptide);
    }

    let result = proteins.into_iter().map(|(name, peptides)| Protein { name, peptides }).collect();
    let mice = headers.iter().skip(max_index + 1).map(|x| x.to_string()).collect();
    let mut processed_groups = Vec::new();

    for group in groups {
        let mut mice_vec = Vec::new();
        for col in &group.columns {
            let col_number = column_name_to_number(&col.to_uppercase());
            match headers.get(col_number.into()) {
                Some(header) => mice_vec.push(header.to_string()),
                None => return Err(format!("Column {} doesn't exist", col).into()),
            }
        }
        processed_groups.push(Group {
            name: group.name.clone(),
            mice: mice_vec,
        });
    }

    Ok((result, mice, processed_groups))
}