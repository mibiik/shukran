// Rastgele, enteresan kullanıcı isimleri oluşturmak için
const adjectives = [
  'Ocean', 'Starlight', 'Moonbeam', 'Sunrise', 'Rainbow', 'Mystic', 'Golden', 'Silver',
  'Crystal', 'Diamond', 'Pearl', 'Amber', 'Sapphire', 'Emerald', 'Ruby', 'Topaz',
  'Cosmic', 'Celestial', 'Ethereal', 'Serene', 'Tranquil', 'Peaceful', 'Harmonious',
  'Radiant', 'Luminous', 'Brilliant', 'Sparkling', 'Shimmering', 'Glowing', 'Bright',
  'Wise', 'Gentle', 'Kind', 'Joyful', 'Cheerful', 'Hopeful', 'Optimistic', 'Inspiring',
  'Dreamy', 'Magical', 'Enchanted', 'Wonderful', 'Amazing', 'Incredible', 'Fantastic',
  'Adventurous', 'Curious', 'Creative', 'Artistic', 'Poetic', 'Musical', 'Dancing',
  'Flying', 'Soaring', 'Flowing', 'Dancing', 'Singing', 'Whispering', 'Laughing'
];

const nouns = [
  'Dreamer', 'Seeker', 'Explorer', 'Wanderer', 'Traveler', 'Adventurer', 'Discoverer',
  'Creator', 'Artist', 'Poet', 'Writer', 'Singer', 'Dancer', 'Musician', 'Painter',
  'Sage', 'Wizard', 'Mage', 'Enchanter', 'Guardian', 'Protector', 'Healer', 'Teacher',
  'Student', 'Scholar', 'Thinker', 'Philosopher', 'Meditator', 'Yogi', 'Monk',
  'Angel', 'Spirit', 'Soul', 'Heart', 'Mind', 'Soul', 'Essence', 'Being',
  'Butterfly', 'Dragonfly', 'Hummingbird', 'Eagle', 'Phoenix', 'Unicorn', 'Dragon',
  'Star', 'Moon', 'Sun', 'Cloud', 'Wave', 'River', 'Mountain', 'Forest', 'Garden',
  'Flower', 'Rose', 'Lily', 'Lotus', 'Daisy', 'Tulip', 'Orchid', 'Jasmine',
  'Crystal', 'Gem', 'Pearl', 'Diamond', 'Treasure', 'Jewel', 'Crown', 'Tiara'
];

// Rastgele isim oluştur
export const generateRandomName = (): string => {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 999) + 1;
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
};

// Kullanıcı ismini almak için utility fonksiyonu
export const getUserDisplayName = (user: any): string => {
  if (!user) return 'Unknown User';
  
  // Eğer user_metadata'da display_name varsa onu kullan
  if (user.user_metadata?.display_name) {
    return user.user_metadata.display_name;
  }
  
  // Eğer anonim kullanıcıysa email'den isim çıkar
  if (user.email && user.email.includes('@shukran.local')) {
    const emailName = user.email.split('@')[0];
    // İlk harfi büyük yap
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }
  
  // Normal kullanıcılar için email'in @ öncesini kullan
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'Anonymous User';
};

// Kullanıcının anonim olup olmadığını kontrol et
export const isAnonymousUser = (user: any): boolean => {
  if (!user) return false;
  
  // user_metadata'da is_anonymous flag'i varsa
  if (user.user_metadata?.is_anonymous) {
    return true;
  }
  
  // Email @shukran.local ile bitiyorsa anonim kullanıcı
  if (user.email && user.email.includes('@shukran.local')) {
    return true;
  }
  
  return false;
};

// Örnek isimler (test için)
export const exampleNames = [
  'OceanDreamer42', 'StarlightSeeker156', 'MoonbeamExplorer789', 'RainbowCreator234',
  'MysticSage567', 'GoldenButterfly123', 'CrystalDancer456', 'CosmicPhoenix789',
  'EtherealSinger234', 'SerenePoet567', 'RadiantArtist123', 'LuminousWriter456',
  'WiseGuardian789', 'GentleHealer234', 'JoyfulMusician567', 'HopefulDancer123',
  'DreamyUnicorn456', 'MagicalDragon789', 'EnchantedStar234', 'WonderfulMoon567'
];
