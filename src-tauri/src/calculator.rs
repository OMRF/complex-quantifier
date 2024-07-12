use std::collections::HashMap;
use std::error::Error;
use crate::parser::{Intensity, MouseId, Peptide, Protein, ProteinName, Sequence};

pub fn calc_protein_geometric_means(proteins: Vec<Protein>, mice: Vec<MouseId>) -> HashMap<ProteinName, HashMap<MouseId, f64>> {
    let mut protein_calculations = HashMap::new();

    for protein in proteins {
        let mut peptide_sums: HashMap<Sequence, HashMap<MouseId, f64>> = HashMap::new();

        for peptide in protein.peptides {
            let mut intensities: HashMap<MouseId, Vec<f64>> = HashMap::new();

            for intensity in peptide.intensities {
                let mouse = intensity.mouse;
                let value = intensity.value;

                if intensities.contains_key(&mouse) {
                    intensities.get_mut(&mouse).unwrap().push(value);
                } else {
                    intensities.insert(mouse, vec![value]);
                }
            }

            for (mouse, intensities) in intensities {
                let sum: f64 = intensities.iter().sum();

                if peptide_sums.contains_key(&peptide.sequence) {
                    peptide_sums.get_mut(&peptide.sequence).unwrap().insert(mouse, sum);
                } else {
                    let mut mouse_sums: HashMap<MouseId, f64> = HashMap::new();
                    mouse_sums.insert(mouse, sum);
                    peptide_sums.insert(peptide.sequence.clone(), mouse_sums);
                }
            }
        }

        // take geometric means of all the sums for a given mouse
        let mut protein_sums: HashMap<MouseId, f64> = HashMap::new();

        for mouse in &mice {
            let mut mouse_sums: Vec<f64> = Vec::new();

            for (_, sums) in &peptide_sums {
                if sums.contains_key(mouse) {
                    let sum = sums.get(mouse).unwrap();
                    mouse_sums.push(*sum);
                }
            }

            let geometric_mean: f64 = mouse_sums.iter().product::<f64>().powf(1.0 / mouse_sums.len() as f64);
            protein_sums.insert(mouse.clone(), geometric_mean);
        }

        protein_calculations.insert(protein.name, protein_sums);
    }

    protein_calculations
}

pub fn normalize_protein_abundances(
    normalizing_protein: String,
    normalizing_protein_conc: f64,
    mut geo_means: HashMap<ProteinName, HashMap<MouseId, f64>>,
) -> Result<HashMap<ProteinName, HashMap<MouseId, f64>>, Box<dyn Error>> {
    let normalizing_protein = normalizing_protein.to_lowercase().trim().to_string();

    let normalizing_protein_key = geo_means
        .keys()
        .find(|protein| protein.to_lowercase().trim() == normalizing_protein)
        .ok_or("Normalizing protein not found")?;

    let normalizing_factors = geo_means.get(normalizing_protein_key).unwrap();


    let updates: Vec<_> = geo_means.iter()
        .filter(|(protein, _)| *protein != &normalizing_protein)
        .flat_map(|(protein, mice_to_geo_means)| {
            mice_to_geo_means.iter().filter_map(move |(mouse, geo_mean)| {
                normalizing_factors.get(mouse).map(|norm_factor| {
                    (protein.clone(), mouse.clone(), (geo_mean / norm_factor) * normalizing_protein_conc)
                })
            })
        })
        .collect();

    for (protein, mouse, normalized_value) in updates {
        geo_means.entry(protein).or_default().insert(mouse, normalized_value);
    }

    Ok(geo_means)
}