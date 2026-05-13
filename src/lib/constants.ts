// Constants for the Fashion Dashboard

export const BRANDS = [
  'Dior',
  'Chanel',
  'Isabel Marant',
  'Sandro',
  'Maje',
  'Zadig & Voltaire',
  'Celine',
  'Saint Laurent',
  'Gucci',
  'Prada',
  'Balenciaga',
  'Loewe',
  'Hermes',
  'Louis Vuitton',
  'Burberry',
  'Max Mara',
  'Acne Studios',
  'The Kooples',
  'Ba&sh',
  'Jacquemus',
  'Other',
] as const;

export const CATEGORIES = [
  'Dress',
  'Top',
  'Jacket',
  'Coat',
  'Pants',
  'Skirt',
  'Shoes',
  'Bag',
  'Accessory',
] as const;

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'One Size'] as const;

export const PLATFORMS = ['Vinted'] as const;

export const CONDITIONS = ['New with tags', 'Like new', 'Good', 'Fair'] as const;

export const COLORS = [
  'Black',
  'White',
  'Navy',
  'Beige',
  'Grey',
  'Brown',
  'Red',
  'Pink',
  'Blue',
  'Green',
  'Yellow',
  'Orange',
  'Purple',
  'Gold',
  'Silver',
  'Multicolor',
] as const;

export const ITEM_STATUSES = ['In Stock', 'Sold'] as const;

// Reference generation - French words
// R = Robe (Dress), H = Haut (Top), V = Veste (Jacket), M = Manteau (Coat)
// P = Pantalon (Pants), J = Jupe (Skirt), C = Chaussures (Shoes), S = Sac (Bag), A = Accessoire

export const CATEGORY_CODES: Record<string, string> = {
  'Dress': 'R',      // Robe
  'Top': 'H',        // Haut
  'Jacket': 'V',     // Veste
  'Coat': 'M',       // Manteau
  'Pants': 'P',      // Pantalon
  'Skirt': 'J',      // Jupe
  'Shoes': 'C',      // Chaussures
  'Bag': 'S',        // Sac
  'Accessory': 'A',  // Accessoire
};

// N = Noir, B = Blanc, M = Marine, E = Beige, G = Gris, R = Marron
// O = Rouge, P = Rose, L = Bleu, V = Vert, J = Jaune, O = Orange, U = Violet

export const COLOR_CODES: Record<string, string> = {
  'Black': 'N',       // Noir
  'White': 'B',       // Blanc
  'Navy': 'M',        // Marine
  'Beige': 'E',       // bEige
  'Grey': 'G',        // Gris
  'Brown': 'R',       // maRron
  'Red': 'O',         // rOuge
  'Pink': 'P',        // rose (Pink)
  'Blue': 'L',        // bLeu
  'Green': 'V',       // Vert
  'Yellow': 'J',      // Jaune
  'Orange': 'A',      // orAnge
  'Purple': 'U',      // violet (pUrple)
  'Gold': 'D',        // Dore
  'Silver': 'I',      // argentI (Argent)
  'Multicolor': 'X',  // miXte
};