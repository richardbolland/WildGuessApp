// src/animals.js
export const ANIMAL_GROUPS = [
    // --- CARNIVORES ---
    {
        emoji: "🐺", name: "Canines",
        animals: [
            { name: "Wolf", sciName: "Canis lupus", family: "Canidae", clue: "Pack hunter whose howl defines the wilderness; ancestor of the domestic dog." },
            { name: "Coyote", sciName: "Canis latrans", family: "Canidae", clue: "Adaptable trickster of folklore; known for yipping at the moon." },
            { name: "Fox", sciName: "Vulpes vulpes", family: "Canidae", clue: "Cunning, bushy-tailed omnivore that hunts with a characteristic pounce." },
            { name: "Dingo", sciName: "Canis lupus dingo", displayLatin: "Canis familiaris (var.)", family: "Canidae", clue: "Apex predator of the Australian outback; rarely barks." },
            { name: "Wild Dog", sciName: "Lycaon pictus", family: "Canidae", clue: "Mottled African hunter with rounded ears; lives in close-knit packs." },
            { name: "Jackal", sciName: "Canis aureus", family: "Canidae", clue: "Scavenger of the savanna; often associated with Anubis in myth." }
        ]
    },
    {
        emoji: "🦁", name: "Felines",
        animals: [
            { name: "Lion", sciName: "Panthera leo", displayLatin: "Felis leo", family: "Felidae", clue: "Only social cat; males sport a regal ruff of hair." },
            { name: "Tiger", sciName: "Panthera tigris", displayLatin: "Felis tigris", family: "Felidae", clue: "Striped ambush predator; swims well and rules the Asian jungles." },
            { name: "Cheetah", sciName: "Acinonyx jubatus", family: "Felidae", clue: "Sprint specialist with non-retractable claws; hunts by day." },
            { name: "Jaguar", sciName: "Panthera onca", family: "Felidae", clue: "New World cat with a bite strong enough to crack turtle shells." },
            { name: "Snow Leopard", sciName: "Panthera uncia", family: "Felidae", clue: "Ghost of the mountains; uses a massive tail for balance on cliffs." },
            { name: "Cougar", sciName: "Puma concolor", family: "Felidae", clue: "Mountain dweller with the most names of any animal; screams like a human." }
        ]
    },
    {
        emoji: "🐻", name: "Bears",
        animals: [
            { name: "Bear (Brown)", sciName: "Ursus arctos", family: "Ursidae", clue: "Massive omnivore with a shoulder hump; fishes during salmon runs." },
            { name: "Bear (Polar)", sciName: "Ursus maritimus", family: "Ursidae", clue: "Marine predator of the ice; skin is black, but fur appears white." },
            { name: "Panda", sciName: "Ailuropoda melanoleuca", family: "Ursidae", clue: "Bamboo specialist with a modified wrist bone acting as a thumb." },
            { name: "Bear (Black)", sciName: "Ursus americanus", family: "Ursidae", clue: "Forest climber of North America; despite the name, can be cinnamon colored." },
            { name: "Bear (Sun)", sciName: "Helarctos malayanus", family: "Ursidae", clue: "Smallest of its kind; arboreal with a golden chest crescent." }
        ]
    },
    {
        emoji: "🦡", name: "Weasels & Badgers", 
        animals: [
            { name: "Wolverine", sciName: "Gulo gulo", family: "Mustelidae", clue: "Ferocious glutton of the north; known to fight off bears for food." },
            { name: "Badger", sciName: "Meles meles", family: "Mustelidae", clue: "Distinctive striped face; lives in extensive underground setts." },
            { name: "Honey Badger", sciName: "Mellivora capensis", family: "Mustelidae", clue: "Thick-skinned warrior; famous for raiding beehives and fearing nothing." },
            { name: "Stoat", sciName: "Mustela erminea", family: "Mustelidae", clue: "Small predator that turns white in winter (ermine) to hunt in snow." },
            { name: "Ferret (Black-footed)", sciName: "Mustela nigripes", family: "Mustelidae", clue: "Highly endangered prairie dweller; relies almost entirely on prairie dogs." }
        ]
    },
    // --- PRIMATES ---
    {
        emoji: "🐒", name: "Primates",
        animals: [
            { name: "Gorilla", sciName: "Gorilla", displayLatin: "Troglodytes gorilla", family: "Hominidae", clue: "Gentle giant of the jungle; silverbacks lead the troop." },
            { name: "Chimpanzee", sciName: "Pan troglodytes", family: "Hominidae", clue: "Tool-using ape; shares nearly 99% of DNA with humans." },
            { name: "Orangutan", sciName: "Pongo", family: "Hominidae", clue: "Solitary 'Person of the Forest'; rare red ape of Sumatra/Borneo." },
            { name: "Lemur", sciName: "Lemur catta", displayLatin: "Prosimii catta", family: "Suborder: Strepsirrhini", clue: "Prosimian endemic to one island; famous for its ghostly stare and striped tail." },
            { name: "Baboon", sciName: "Papio anubis", family: "Cercopithecidae", clue: "Ground-dweller with a dog-like muzzle and formidable canines." },
            { name: "Mandrill", sciName: "Mandrillus sphinx", displayLatin: "Simia sphinx", family: "Cercopithecidae", clue: "World's largest monkey; features a vibrant red and blue face." }
        ]
    },
    // --- HERBIVORES ---
    {
        emoji: "🐘", name: "Savanna Giants", 
        animals: [
            { name: "Giraffe", sciName: "Giraffa", displayLatin: "Cervus camelopardalis", family: "Order: Artiodactyla", clue: "Browser of treetops; born with horns and a purple tongue." },
            { name: "Zebra", sciName: "Equus quagga", family: "Equidae", clue: "Savanna grazer; no two individuals share the same stripe pattern." },
            { name: "Elephant", sciName: "Loxodonta africana", family: "Order: Proboscidea", clue: "Intelligent matriarchal giant; communicates via subsonic rumbles." },
            { name: "Rhino", sciName: "Ceratotherium simum", family: "Order: Perissodactyla", clue: "Armored tank of the bush; hunted for its keratin horn." },
            { name: "Warthog", sciName: "Phacochoerus africanus", family: "Suidae", clue: "Tusked grazer of the plains; famous for kneeling while it eats." }
        ]
    },
    {
        emoji: "🌲", name: "Forest Grazers", 
        animals: [
            { name: "Moose", sciName: "Alces alces", family: "Cervidae", clue: "Solitary northern giant; dives underwater to eat aquatic plants." },
            { name: "Deer (Red)", sciName: "Cervus elaphus", family: "Cervidae", clue: "Antlered forest dweller; males rut in autumn to secure mates." },
            { name: "Elk", sciName: "Cervus canadensis", family: "Cervidae", clue: "Loud bugler of the Rockies; one of the largest deer species." },
            { name: "Bison", sciName: "Bison bison", displayLatin: "Bos americanus", family: "Bovidae", clue: "Woolly tank of the plains; the largest land mammal in North America." },
            { name: "Tapir", sciName: "Tapirus terrestris", family: "Order: Perissodactyla", clue: "Prehensile-nosed jungle dweller; looks like a pig but related to horses." },
            { name: "Okapi", sciName: "Okapia johnstoni", displayLatin: "O. johnstoni", family: "Giraffidae", clue: "The forest giraffe; has zebra-like stripes on its legs." },
            { name: "Sloth", sciName: "Bradypus variegatus", family: "Order: Pilosa", clue: "Host to algae in its fur; so slow it descends only once a week." }
        ]
    },
    {
        emoji: "🌊", name: "River Mammals", 
        animals: [
            { name: "Beaver", sciName: "Castor fiber", family: "Castoridae", clue: "Nature's engineer; fells trees to create its own aquatic habitat." }, 
            { name: "Capybara", sciName: "Hydrochoerus hydrochaeris", family: "Caviidae", clue: "Giant riparian grazer; the world's largest living rodent." },
            { name: "Platypus", sciName: "Ornithorhynchus anatinus", family: "Order: Monotremata", clue: "Bio-fluorescent monotreme; looks like a beaver built by a duck." },
            { name: "Hippo", sciName: "Hippopotamus amphibius", displayLatin: "H. amphibius", family: "Suborder: Whippomorpha", clue: "River titan that secretes 'blood sweat'; territorial and dangerous." },
            { name: "Otter", sciName: "Lutra lutra", family: "Mustelidae", clue: "Semi-aquatic acrobat; hunts fish and plays on riverbanks." },
            { name: "Manatee", sciName: "Trichechus manatus", family: "Order: Sirenia", clue: "Gentle sea cow; grazes on seagrass in warm coastal waters." }
        ]
    },
    {
        emoji: "🦌", name: "Antelopes",
        animals: [
            { name: "Wildebeest", sciName: "Connochaetes taurinus", family: "Bovidae", clue: "The 'Gnu'; crosses rivers in massive herds during the Great Migration." },
            { name: "Impala", sciName: "Aepyceros melampus", family: "Bovidae", clue: "McDonald's of the Bush; known for distinct black heel markings." },
            { name: "Gazelle", sciName: "Eudorcas thomsonii", family: "Bovidae", clue: "Delicate sprinter; performs 'stotting' jumps to signal fitness." },
            { name: "Oryx", sciName: "Oryx gazella", displayLatin: "O. gazella", family: "Bovidae", clue: "Desert survivor; wields straight, rapier-like horns." },
            { name: "Kudu", sciName: "Tragelaphus strepsiceros", family: "Bovidae", clue: "Grey ghost of the bush; males bear magnificent corkscrew horns." },
            { name: "Springbok", sciName: "Antidorcas marsupialis", family: "Bovidae", clue: "National symbol of South Africa; famous for its pronking displays." }
        ]
    },
    {
        emoji: "🐭", name: "Small Mammals", 
        animals: [
            { name: "Mouse", sciName: "Mus musculus", family: "Muridae", clue: "Tiny commensal squeaker; likely the most numerous mammal in human homes." },
            { name: "Chipmunk", sciName: "Tamias striatus", family: "Sciuridae", clue: "Striped hoarder of the forest floor; famous for stuffing its cheeks with food." },
            { name: "Squirrel", sciName: "Sciurus vulgaris", family: "Sciuridae", clue: "Bushy-tailed hoarder; plays a key role in planting forests by forgetting nuts." },
            { name: "Rabbit", sciName: "Oryctolagus cuniculus", family: "Leporidae", clue: "Long-eared hopper; lives in warrens and breeds proverbially fast." },
            { name: "Hedgehog", sciName: "Erinaceus europaeus", family: "Erinaceidae", clue: "Nocturnal insectivore; rolls into a prickly ball when threatened." },
            { name: "Raccoon", sciName: "Procyon lotor", family: "Procyonidae", clue: "Masked bandit of the trash can; washes food with dexterous paws." },      
            { name: "Skunk", sciName: "Mephitis mephitis", family: "Mephitidae", clue: "Boldly striped and slow-moving; armed with a chemical weapon." }, 
            { name: "Meerkat", sciName: "Suricata suricatta", family: "Herpestidae", clue: "Social desert dweller; stands upright on sentry duty." },
            { name: "Bat", sciName: "Tadarida brasiliensis", family: "Order: Chiroptera", clue: "Only mammal capable of true flight; navigates via echolocation." },
            { name: "Armadillo", sciName: "Dasypus novemcinctus", family: "Order: Cingulata", clue: "Leathery tank of the Americas; the only mammal with a shell." }
        ]
    },
    {
        emoji: "🦘", name: "Marsupials",
        animals: [
            { name: "Kangaroo", sciName: "Macropus rufus", family: "Macropodidae", clue: "The 'Big Red'; boxes rivals and carries young in a pouch." },
            { name: "Koala", sciName: "Phascolarctos cinereus", family: "Phascolarctidae", clue: "Sleepy eucalyptus specialist; possess fingerprints like humans." },
            { name: "Sugar Glider", sciName: "Petaurus breviceps", family: "Petauridae", clue: "Small nocturnal arboreal; uses a membrane to soar between trees." }, 
            { name: "Opossum", sciName: "Didelphis virginiana", family: "Didelphidae", clue: "New World marsupial; famous for feigning death." },
            { name: "Wombat", sciName: "Vombatus ursinus", family: "Order: Diprotodontia", clue: "Cube-pooping burrower; uses a reinforced rump for defense." }
        ]
    },
    // --- BIRDS ---
    {
        emoji: "🦅", name: "Raptors",
        animals: [
            { name: "Eagle", sciName: "Haliaeetus leucocephalus", family: "Accipitridae", clue: "Apex predator of the sky; symbol of freedom in the west." },
            { name: "Owl", sciName: "Tyto alba", family: "Tytonidae", clue: "Silent night flyer; can rotate its head 270 degrees." },
            { name: "Hawk", sciName: "Buteo jamaicensis", family: "Accipitridae", clue: "Broad-winged soarer; its scream is often dubbed over eagle footage." },
            { name: "Falcon", sciName: "Falco peregrinus", family: "Order: Falconiformes", clue: "Aerodynamic diver; the fastest member of the animal kingdom." },
            { name: "Vulture", sciName: "Cathartes aura", family: "Cathartidae", clue: "Bald-headed recycler; cleans the environment by eating the dead." },
            { name: "Osprey", sciName: "Pandion haliaetus", family: "Pandionidae", clue: "Specialized angler; carries fish aerodynamically with reversible toes." }
        ]
    },
    {
        emoji: "🦆", name: "Water Birds",
        animals: [
            { name: "Penguin", sciName: "Aptenodytes forsteri", family: "Spheniscidae", clue: "Flightless tuxedo wearer; endures the harshest winter on Earth." },
            { name: "Pelican", sciName: "Pelecanus occidentalis", family: "Pelecanidae", clue: "Coastal fisher; its beak holds more than its belly." },
            { name: "Swan", sciName: "Cygnus olor", family: "Anatidae", clue: "Symbol of grace; monogamous waterfowl with a powerful wing strike." },
            { name: "Flamingo", sciName: "Phoenicopterus roseus", family: "Phoenicopteridae", clue: "Filter feeder; turns pink from the carotenoids in its diet." },
            { name: "Stork", sciName: "Ciconia ciconia", family: "Ciconiidae", clue: "Leggy wader; mythologically associated with delivering babies." },
            { name: "Duck", sciName: "Anas platyrhynchos", family: "Anatidae", clue: "Dabbling swimmer; males often sport an iridescent green head." }
        ]
    },
    {
        emoji: "🦜", name: "Exotic Birds",
        animals: [
            { name: "Macaw", sciName: "Ara macao", displayLatin: "Tribe: Arini", family: "Psittacidae", clue: "Vibrant rainforest loudmouth; cracks nuts with a powerful beak." },
            { name: "Toucan", sciName: "Ramphastos toco", family: "Ramphastidae", clue: "Frugivore with a bill that looks too large for its body." },
            { name: "Peacock", sciName: "Pavo cristatus", family: "Phasianidae", clue: "Ground bird; male performs a dazzling 'eyed' fan dance." },
            { name: "Hummingbird", sciName: "Archilochus colubris", family: "Trochilidae", clue: "Nectar sipper; the only bird capable of flying backwards." },
            { name: "Parrot", sciName: "Psittacus erithacus", family: "Psittacidae", clue: "Grey intellectual; capable of mimicking human speech with context." },
            { name: "Ibis", sciName: "Eudocimus ruber", family: "Threskiornithidae", clue: "Brilliant red wading bird found in wetlands." }
        ]
    },
    {
        emoji: "🐦", name: "Songbirds", 
        animals: [
            { name: "Robin", sciName: "Erithacus rubecula", family: "Muscicapidae", clue: "Herald of spring; aggressive defender of its garden territory." },
            { name: "Blue Jay", sciName: "Cyanocitta cristata", family: "Corvidae", clue: "Crested corvid; noisy mimic known for mobbing hawks." },
            { name: "Sparrow", sciName: "Passer domesticus", family: "Passeridae", clue: "Urban survivor; ubiquitous brown bird that chirps in hedges." },
            { name: "Crow", sciName: "Corvus corone", family: "Corvidae", clue: "All-black problem solver; recognizes individual human faces." },
            { name: "Pigeon", sciName: "Columba livia", family: "Columbidae", clue: "Cliff-dwelling dove adapted to city skyscrapers; creates 'milk' for young." },
            { name: "Cardinal", sciName: "Cardinalis cardinalis", family: "Cardinalidae", clue: "Brilliant red songbird; angry looking, but distinct whistle." }
        ]
    },
    {
        emoji: "🦃", name: "Ground Birds", 
        animals: [
            { name: "Ostrich", sciName: "Struthio camelus", family: "Struthionidae", clue: "Flightless titan; lays the largest egg of any living animal." },
            { name: "Emu", sciName: "Dromaius novaehollandiae", family: "Dromaiidae", clue: "Australia's runner; survives the outback and won a war against humans." },
            { name: "Cassowary", sciName: "Casuarius casuarius", family: "Casuariidae", clue: "The 'murder bird'; wears a helmet and wields a dagger-like toe." },
            { name: "Turkey", sciName: "Meleagris gallopavo", family: "Phasianidae", clue: "Wattled forest dweller; Ben Franklin preferred it over the Eagle." },
            { name: "Roadrunner", sciName: "Geococcyx californianus", family: "Cuculidae", clue: "Desert sprinter; famous for eating rattlesnakes and outsmarting coyotes." },
            { name: "Kiwi", sciName: "Apteryx mantelli", family: "Apterygidae", clue: "New Zealand's icon; flightless, nocturnal, and whiskers like a cat." }
        ]
    },
    // --- REPTILES & AQUATIC ---
    {
        emoji: "🐊", name: "Reptiles",
        animals: [
            { name: "Crocodile", sciName: "Crocodylus niloticus", displayLatin: "C. niloticus", family: "Clade: Eusuchia", clue: "Prehistoric ambush predator; has a V-shaped snout and toothy grin." },
            { name: "Cobra", sciName: "Ophiophagus hannah", family: "Elapidae", clue: "Hooded serpent; rises up to display a spectacle pattern." },
            { name: "Tortoise", sciName: "Chelonoidis", family: "Testudinidae", clue: "Armored grazer; can live well over 100 years." },
            { name: "Iguana", sciName: "Iguana iguana", displayLatin: "Iguanidae (Type Sp.)", family: "Clade: Pleurodonta", clue: "Spiny arboreal lizard; sneezes salt and drops from trees when cold." },
            { name: "Komodo Dragon", sciName: "Varanus komodoensis", displayLatin: "Varanus (Giant)", family: "Varanidae", clue: "Island giant; hunts with bacteria-laden saliva and venom." },
            { name: "Boa", sciName: "Boa constrictor", displayLatin: "Constrictor constrictor", family: "Boidae", clue: "New World constrictor; gives birth to live young." },
            { name: "Chameleon", sciName: "Furcifer pardalis", family: "Chamaeleonidae", clue: "Zygodactyl climber; changes color for mood, not just camouflage." }
        ]
    },
    {
        emoji: "🐸", name: "Amphibians",
        animals: [
            { name: "Bullfrog", sciName: "Lithobates catesbeianus", family: "Ranidae", clue: "Voracious eater; anything that fits in its mouth is food." },
            { name: "Toad", sciName: "Bufo bufo", family: "Bufonidae", clue: "Warty walker; produces bufotoxin to deter predators." },
            { name: "Salamandra", sciName: "Salamandra salamandra", displayLatin: "Order: Urodela", family: "Salamandridae", clue: "Fire lizard of legend; warns predators with yellow spots." },
            { name: "Axolotl", sciName: "Ambystoma mexicanum", family: "Ambystomatidae", clue: "The 'Walking Fish'; stays in its larval form forever." },
            { name: "Frog (Tree)", sciName: "Agalychnis callidryas", family: "Hylidae", clue: "Sticky-toed climber; famous for bright green skin and red eyes." }
        ]
    },
    {
        emoji: "🐬", name: "Marine",
        animals: [
            { name: "Whale", sciName: "Balaenoptera musculus", family: "Balaenopteridae", clue: "Gentle giant; heart is the size of a small car." },
            { name: "Dolphin", sciName: "Tursiops", family: "Delphinidae", clue: "Playful cetacean; uses distinct whistles to identify friends." },
            { name: "Shark", sciName: "Carcharodon carcharias", family: "Lamnidae", clue: "Cartilaginous predator; can sense electricity in the water." },
            { name: "Octopus", sciName: "Octopus vulgaris", displayLatin: "Octopoda (Common)", family: "Octopodidae", clue: "Master of disguise; has three hearts and blue blood." },
            { name: "Seal", sciName: "Phoca vitulina", family: "Phocidae", clue: "Pinniped 'sea dog'; hauls out on rocks to rest." },
            { name: "Crab", sciName: "Callinectes sapidus", family: "Portunidae", clue: "Decapod scavenger; walks sideways and wields pincers." }
        ]
    },
    {
        emoji: "🐠", name: "Fish",
        animals: [
            { name: "Goldfish", sciName: "Carassius auratus", family: "Cyprinidae", clue: "Carp descendant; selectively bred for centuries for color." },
            { name: "Salmon", sciName: "Salmo salar", displayLatin: "S. salar", family: "Order: Salmoniformes", clue: "The Leaper; returns to its natal stream to spawn and die." },
            { name: "Clownfish", sciName: "Amphiprion ocellaris", family: "Pomacentridae", clue: "Anemone dweller; immune to the stings of its host." },
            { name: "Seahorse", sciName: "Hippocampus guttulatus", family: "Syngnathidae", clue: "Upright swimmer; the male carries the pregnancy." },
            { name: "Piranha", sciName: "Pygocentrus nattereri", family: "Serrasalmidae", clue: "Amazonian shoaler; possesses interlocking teeth and a scary reputation." }
        ]
    },
    {
        emoji: "🦋", name: "Insects+",
        animals: [
            { name: "Butterfly", sciName: "Danaus plexippus", family: "Nymphalidae", clue: "Migratory marvel; tastes with its feet and originated as a caterpillar." },
            { name: "Bee", sciName: "Apis mellifera", family: "Apidae", clue: "Important pollinator that lives in hives and produces wax." },
            { name: "Tarantula", sciName: "Brachypelma", family: "Theraphosidae", clue: "Hairy arachnid; flicks urticating bristles when threatened." },
            { name: "Scorpion", sciName: "Pandinus imperator", family: "Scorpionidae", clue: "Fluorescent arachnid; carries a stinger on a segmented tail." },
            { name: "Snail", sciName: "Cornu aspersum", family: "Helicidae", clue: "Hermaphroditic grazer; carries its calcium house on its back." },
            { name: "Mantis", sciName: "Mantis religiosa", displayLatin: "Order: Mantodea", family: "Mantidae", clue: "Patient ambush predator; famous for sexual cannibalism." }
        ]
    }
];