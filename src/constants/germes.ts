// Reference germ/pathogen codes for lab results
export interface GermeRef {
  code: string
  nom: string
  type: "bacterie" | "virus" | "parasite" | "champignon"
}

export const GERME_TYPES = [
  { key: "bacterie", label: "Bactéries" },
  { key: "virus", label: "Virus" },
  { key: "parasite", label: "Parasites" },
  { key: "champignon", label: "Champignons" },
] as const

export const GERMES: GermeRef[] = [
  // Bactéries
  { code: "SALMONELLA_TYPHI", nom: "Salmonella typhi", type: "bacterie" },
  { code: "SALMONELLA_PARATYPHI", nom: "Salmonella paratyphi", type: "bacterie" },
  { code: "VIBRIO_CHOLERAE", nom: "Vibrio cholerae", type: "bacterie" },
  { code: "SHIGELLA", nom: "Shigella spp.", type: "bacterie" },
  { code: "E_COLI_O157", nom: "E. coli O157:H7", type: "bacterie" },
  { code: "NEISSERIA_MENINGITIDIS", nom: "Neisseria meningitidis", type: "bacterie" },
  { code: "STREPTOCOCCUS_PNEUMONIAE", nom: "Streptococcus pneumoniae", type: "bacterie" },
  { code: "MYCOBACTERIUM_TB", nom: "Mycobacterium tuberculosis", type: "bacterie" },
  { code: "BORDETELLA_PERTUSSIS", nom: "Bordetella pertussis", type: "bacterie" },
  { code: "CORYNEBACTERIUM_DIPHTHERIAE", nom: "Corynebacterium diphtheriae", type: "bacterie" },
  { code: "CLOSTRIDIUM_TETANI", nom: "Clostridium tetani", type: "bacterie" },
  { code: "BRUCELLA", nom: "Brucella spp.", type: "bacterie" },
  { code: "LEGIONELLA", nom: "Legionella pneumophila", type: "bacterie" },
  { code: "LISTERIA", nom: "Listeria monocytogenes", type: "bacterie" },
  { code: "STAPHYLOCOCCUS_AUREUS_MRSA", nom: "Staphylococcus aureus (MRSA)", type: "bacterie" },
  { code: "ACINETOBACTER_BAUMANNII", nom: "Acinetobacter baumannii", type: "bacterie" },
  { code: "KLEBSIELLA_PNEUMONIAE", nom: "Klebsiella pneumoniae", type: "bacterie" },
  { code: "PSEUDOMONAS_AERUGINOSA", nom: "Pseudomonas aeruginosa", type: "bacterie" },
  { code: "ENTEROCOCCUS_VRE", nom: "Enterococcus (VRE)", type: "bacterie" },

  // Virus
  { code: "SARS_COV_2", nom: "SARS-CoV-2", type: "virus" },
  { code: "INFLUENZA_A", nom: "Influenza A", type: "virus" },
  { code: "INFLUENZA_B", nom: "Influenza B", type: "virus" },
  { code: "HEPATITE_A", nom: "Virus de l'hépatite A", type: "virus" },
  { code: "HEPATITE_B", nom: "Virus de l'hépatite B", type: "virus" },
  { code: "HEPATITE_C", nom: "Virus de l'hépatite C", type: "virus" },
  { code: "VIH", nom: "VIH", type: "virus" },
  { code: "ROUGEOLE", nom: "Virus de la rougeole", type: "virus" },
  { code: "RUBEOLE", nom: "Virus de la rubéole", type: "virus" },
  { code: "DENGUE", nom: "Virus de la dengue", type: "virus" },
  { code: "CHIKUNGUNYA", nom: "Virus du chikungunya", type: "virus" },
  { code: "ZIKA", nom: "Virus Zika", type: "virus" },
  { code: "ROTAVIRUS", nom: "Rotavirus", type: "virus" },
  { code: "NOROVIRUS", nom: "Norovirus", type: "virus" },
  { code: "RAGE", nom: "Virus de la rage", type: "virus" },
  { code: "WEST_NILE", nom: "West Nile virus", type: "virus" },

  // Parasites
  { code: "PLASMODIUM_FALCIPARUM", nom: "Plasmodium falciparum", type: "parasite" },
  { code: "PLASMODIUM_VIVAX", nom: "Plasmodium vivax", type: "parasite" },
  { code: "LEISHMANIA", nom: "Leishmania spp.", type: "parasite" },
  { code: "TOXOPLASMA", nom: "Toxoplasma gondii", type: "parasite" },
  { code: "GIARDIA", nom: "Giardia lamblia", type: "parasite" },
  { code: "ENTAMOEBA", nom: "Entamoeba histolytica", type: "parasite" },
  { code: "ECHINOCOCCUS", nom: "Echinococcus granulosus", type: "parasite" },

  // Champignons
  { code: "CANDIDA_ALBICANS", nom: "Candida albicans", type: "champignon" },
  { code: "ASPERGILLUS", nom: "Aspergillus spp.", type: "champignon" },
  { code: "CRYPTOCOCCUS", nom: "Cryptococcus neoformans", type: "champignon" },
]
