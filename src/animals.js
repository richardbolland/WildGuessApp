// src/animals.js
export const ANIMAL_GROUPS = [
    // --- CARNIVORES ---
    {
        emoji: "🐺", name: "Canines",
        animals: [
            { name: "Wolf", sciName: "Canis lupus", family: "Canidae", clue: "Apex social hunter; legendary ancestor of man's best friend." },
            { name: "Coyote", sciName: "Canis latrans", family: "Canidae", clue: "Opportunistic trickster; expanded its range while other predators retreated." },
            { name: "Fox", sciName: "Vulpes vulpes", family: "Canidae", clue: "Solitary omnivore; hunts with a unique diving pounce into snow or grass." },
            { name: "Dingo", sciName: "Canis lupus dingo", displayLatin: "Canis familiaris (var.)", family: "Canidae", clue: "Golden-coated apex predator introduced to an island continent millennia ago." },
            { name: "Wild Dog", sciName: "Lycaon pictus", family: "Canidae", clue: "Highly social cursorial hunter; votes on pack movements with sneezes." },
            { name: "Jackal", sciName: "Canis aureus", family: "Canidae", clue: "Opportunistic scavenger; mated pairs hold territory in the scrublands." }
        ]
    },
    {
        emoji: "🦁", name: "Felines",
        animals: [
            { name: "Lion", sciName: "Panthera leo", displayLatin: "Felis leo", family: "Felidae", clue: "The only social feline; dominant males defend the pride's territory." },
            { name: "Tiger", sciName: "Panthera tigris", displayLatin: "Felis tigris", family: "Felidae", clue: "Largest of the big cats; a solitary swimmer that stalks the jungle." },
            { name: "Cheetah", sciName: "Acinonyx jubatus", family: "Felidae", clue: "Sacrificed fighting power for pure acceleration; cannot roar." },
            { name: "Jaguar", sciName: "Panthera onca", family: "Felidae", clue: "A swimmer that kills with a skull-crushing bite rather than a throat hold." },
            { name: "Snow Leopard", sciName: "Panthera uncia", family: "Felidae", clue: "Solitary high-altitude stalker; uses a massive tail for warmth and balance." },
            { name: "Cougar", sciName: "Puma concolor", family: "Felidae", clue: "Wide-ranging ambush predator; holds the record for the most common names." }
        ]
    },
    {
        emoji: "🐻", name: "Bears",
        animals: [
            { name: "Bear (Brown)", sciName: "Ursus arctos", family: "Ursidae", clue: "Shoulder-humped giant; gorges in autumn to survive winter dormancy." },
            { name: "Bear (Polar)", sciName: "Ursus maritimus", family: "Ursidae", clue: "Hyper-carnivorous maritime wanderer; black skin absorbs the arctic sun." },
            { name: "Panda", sciName: "Ailuropoda melanoleuca", family: "Ursidae", clue: "Technically a carnivore, but eats a distinct grass; has a 'false thumb'." },
            { name: "Bear (Black)", sciName: "Ursus americanus", family: "Ursidae", clue: "Forest climber; highly adaptable diet ranges from berries to human refuse." },
            { name: "Bear (Sun)", sciName: "Helarctos malayanus", family: "Ursidae", clue: "Smallest of the family; possesses an exceptionally long tongue for extracting honey." }
        ]
    },
    {
        emoji: "🦡", name: "Weasels & Badgers", 
        animals: [
            { name: "Wolverine", sciName: "Gulo gulo", family: "Mustelidae", clue: "Stocky scavenger of the north; famously fearless against much larger predators." },
            { name: "Badger", sciName: "Meles meles", family: "Mustelidae", clue: "Fossorial engineer; constructs massive underground networks passed down for generations." },
            { name: "Honey Badger", sciName: "Mellivora capensis", family: "Mustelidae", clue: "Notoriously thick-skinned; metabolizes venom and surrenders to no one." },
            { name: "Stoat", sciName: "Mustela erminea", family: "Mustelidae", clue: "Performs a mesmerizing 'war dance' to distract prey before striking." },
            { name: "Ferret (Black-footed)", sciName: "Mustela nigripes", family: "Mustelidae", clue: "Once thought extinct; obligate predator of prairie dwelling rodents." }
        ]
    },
    // --- PRIMATES ---
    {
        emoji: "🐒", name: "Primates",
        animals: [
            { name: "Gorilla", sciName: "Gorilla beringei", displayLatin: "G. beringei", family: "Hominidae", clue: "Gentle herbivore of the jungle; troops are led by a gray-haired male." },
            { name: "Chimpanzee", sciName: "Pan troglodytes", family: "Hominidae", clue: "Expert tool-user; hunts colobus monkeys in coordinated groups." },
            { name: "Orangutan", sciName: "Pongo", family: "Hominidae", clue: "Solitary arboreal giant; name translates to 'Person of the Forest'." },
            { name: "Lemur", sciName: "Lemur catta", displayLatin: "Infraorder: Lemuriformes", family: "Suborder: Strepsirrhini", clue: "Prosimian island dweller; uses stink-fights to settle disputes." },
            { name: "Baboon", sciName: "Papio anubis", family: "Cercopithecidae", clue: "Highly aggressive terrestrial forager; complex social hierarchy." },
            { name: "Mandrill", sciName: "Mandrillus sphinx", displayLatin: "Simia sphinx", family: "Cercopithecidae", clue: "World's largest monkey; cryptic forest dweller with vibrant skin coloration." }
        ]
    },
    // --- HERBIVORES ---
    {
        emoji: "🐘", name: "Savanna Giants", 
        animals: [
            { name: "Giraffe", sciName: "Giraffa camelopardalis", displayLatin: "Family: Giraffidae", family: "Order: Artiodactyla", clue: "Tallest terrestrial browser; possesses a specialized valve to prevent fainting when drinking." },
            { name: "Zebra", sciName: "Equus quagga", family: "Equidae", clue: "Equine grazer; visual pattern disrupts predators and deters biting flies." },
            { name: "Elephant", sciName: "Loxodonta africana", family: "Order: Proboscidea", clue: "Ecosystem engineer; mourns its dead and communicates via infrasound." },
            { name: "Rhino", sciName: "Ceratotherium simum", family: "Order: Perissodactyla", clue: "Near-sighted grazer; heavily poached for its keratin nose ornament." },
            { name: "Warthog", sciName: "Phacochoerus africanus", family: "Suidae", clue: "Sleeps in burrows; enters backward to defend the entrance with facial tusks." },
            { name: "Bison", sciName: "Bison bison", displayLatin: "Subfamily: Bovinae", family: "Bovidae", clue: "Keystone species; creates wallows that retain water for the prairie ecosystem." }
        ]
    },
    {
        emoji: "🌲", name: "Forest Grazers", 
        animals: [
            { name: "Moose", sciName: "Alces alces", family: "Cervidae", clue: "Largest of the deer family; dives underwater to graze on aquatic vegetation." },
            { name: "Deer (Red)", sciName: "Cervus elaphus", family: "Cervidae", clue: "Forest monarch; males roar during the autumn rut to secure a harem." },
            { name: "Elk", sciName: "Cervus canadensis", family: "Cervidae", clue: "High-altitude grazer; distinctive ivory teeth were once prized as jewelry." },
            { name: "Tapir", sciName: "Tapirus terrestris", displayLatin: "Family: Tapiridae", family: "Order: Perissodactyla", clue: "Ancient odd-toed ungulate; disperses seeds in the neotropical understory." },
            { name: "Okapi", sciName: "Okapia johnstoni", displayLatin: "Family: Giraffidae", family: "Giraffidae", clue: "Elusive rainforest dweller; famous for its long, prehensile blue tongue." },
            { name: "Sloth", sciName: "Bradypus variegatus", family: "Order: Pilosa", clue: "Metabolism is so slow it hosts a mossy ecosystem in its fur." }
        ]
    },
    {
        emoji: "🌊", name: "River Mammals", 
        animals: [
            { name: "Beaver", sciName: "Castor fiber", family: "Castoridae", clue: "Iron-reinforced teeth; radically alters landscapes to create moats." }, 
            { name: "Capybara", sciName: "Hydrochoerus hydrochaeris", family: "Caviidae", clue: "Gregarious semi-aquatic giant; often seen with other birds sitting on it." },
            { name: "Platypus", sciName: "Ornithorhynchus anatinus", family: "Order: Monotremata", clue: "Bio-fluorescent monotreme; detects electric fields with a sensitive bill." },
            { name: "Hippo", sciName: "Hippopotamus amphibius", displayLatin: "Family: Hippopotamidae", family: "Suborder: Whippomorpha", clue: "Responsible for more human fatalities in Africa than lions; secretes red sunscreen." },
            { name: "Otter", sciName: "Lutra lutra", family: "Mustelidae", clue: "Uses rocks as anvils to crack shellfish; sleeps holding hands to stay anchored." },
            { name: "Manatee", sciName: "Trichechus manatus", displayLatin: "Order: Sirenia", family: "Trichechidae", clue: "Slow-moving grazer; sensitive vibrissae cover its entire body." }
        ]
    },
    {
        emoji: "🦌", name: "Antelopes",
        animals: [
            { name: "Wildebeest", sciName: "Connochaetes taurinus", family: "Bovidae", clue: "Keystone migrator; calves can run minutes after birth to keep up with the mega-herd." },
            { name: "Impala", sciName: "Aepyceros melampus", family: "Bovidae", clue: "Ubiquitous prey species; distinguishes itself with a unique 'M' marking on the rear." },
            { name: "Gazelle", sciName: "Eudorcas thomsonii", family: "Bovidae", clue: "Delicate arid sprinter; performs vertical leaps to signal fitness to predators." },
            { name: "Oryx", sciName: "Oryx gazella", displayLatin: "Subfamily: Antilopinae", family: "Bovidae", clue: "Desert survivor; can raise its body temperature to 46°C to avoid sweating." },
            { name: "Kudu", sciName: "Tragelaphus strepsiceros", family: "Bovidae", clue: "Woodland browser; famously elusive 'Grey Ghost' capable of clearing 2.5m fences." },
            { name: "Springbok", sciName: "Antidorcas marsupialis", family: "Bovidae", clue: "Arid specialist; namesake of a famous rugby team and known for stiff-legged leaps." }
        ]
    },
    {
        emoji: "🐭", name: "Small Mammals", 
        animals: [
            { name: "Jerboa", sciName: "Jaculus", family: "Dipodidae", clue: "Bipedal desert rodent; extracts all necessary water from its food." },
            { name: "Chipmunk", sciName: "Tamias striatus", family: "Sciuridae", clue: "Ground-dwelling sciurid; excavates complex burrows with hidden entrances." },
            { name: "Giant Squirrel", sciName: "Ratufa indica", family: "Sciuridae", clue: "Canopy dweller; builds large globe-shaped nests high in the trees." },
            { name: "Rabbit", sciName: "Oryctolagus cuniculus", family: "Leporidae", clue: "Practice coprophagy (re-eating pellets) to extract maximum nutrients." },
            { name: "Hedgehog", sciName: "Erinaceus europaeus", family: "Erinaceidae", clue: "Immune to many snake venoms; uses anointing behavior to scent its spines." },
            { name: "Raccoon", sciName: "Procyon lotor", family: "Procyonidae", clue: "Highly dexterous tactile specialist; 'sees' with its wet front paws." },      
            { name: "Skunk", sciName: "Mephitis mephitis", family: "Mephitidae", clue: "Aposematic coloring warns of its potent sulfur-based defense spray." }, 
            { name: "Meerkat", sciName: "Suricata suricatta", family: "Herpestidae", clue: "Eusocial mongoose; teaches young how to safely handle scorpions." },
            { name: "Bat", sciName: "Tadarida brasiliensis", family: "Order: Chiroptera", clue: "The only mammal capable of powered flight; comprises 20% of all mammal species." },
            { name: "Armadillo", sciName: "Dasypus novemcinctus", family: "Order: Cingulata", clue: "New World digger; gives birth to identical quadruplets." }
        ]
    },
    {
        emoji: "🦘", name: "Marsupials",
        animals: [
            { name: "Kangaroo", sciName: "Macropus rufus", family: "Macropodidae", clue: "Uses tail as a third leg; cannot move its hind legs independently on land." },
            { name: "Koala", sciName: "Phascolarctos cinereus", family: "Phascolarctidae", clue: "Specialized folivore; brain is smooth because energy is conserved for digestion." },
            { name: "Sugar Glider", sciName: "Petaurus breviceps", family: "Petauridae", clue: "Sap-loving nocturnal marsupial; volplanes between trees in family groups." }, 
            { name: "Opossum", sciName: "Didelphis virginiana", family: "Didelphidae", clue: "North America's only marsupial; immune to pit viper venom and eats thousands of ticks." },
            { name: "Wombat", sciName: "Vombatus ursinus", displayLatin: "Suborder: Vombatiformes", family: "Order: Diprotodontia", clue: "Fossorial grazer; crushes predators' skulls against the burrow roof with its rump." }
        ]
    },
    // --- BIRDS ---
    {
        emoji: "🦅", name: "Raptors",
        animals: [
            { name: "Eagle", sciName: "Haliaeetus leucocephalus", family: "Accipitridae", clue: "Kleptoparasite; often steals food from other birds despite its majestic reputation." },
            { name: "Owl", sciName: "Tyto alba", family: "Tytonidae", clue: "Silent flight feathers; ears are asymmetrical to pinpoint prey in total darkness." },
            { name: "Hawk", sciName: "Buteo jamaicensis", family: "Accipitridae", clue: "Ubiquitous soarer; highly variable plumage makes identification difficult." },
            { name: "Falcon", sciName: "Falco peregrinus", displayLatin: "Genus: Falco", family: "Order: Falconiformes", clue: "Specialized bird-hunter; kills mid-air with a 'tomial tooth' beak notch." },
            { name: "Vulture", sciName: "Cathartes aura", family: "Cathartidae", clue: "Uses strong stomach acid to sanitize the environment; finds food by smell." },
            { name: "Osprey", sciName: "Pandion haliaetus", family: "Pandionidae", clue: "Cosmopolitan raptor; the only one that plunges feet-first into water." }
        ]
    },
    {
        emoji: "🦆", name: "Water Birds",
        animals: [
            { name: "Penguin", sciName: "Aptenodytes forsteri", family: "Spheniscidae", clue: "Southern hemisphere diver; males incubate the egg on their feet for months." },
            { name: "Pelican", sciName: "Pelecanus occidentalis", family: "Pelecanidae", clue: "Cooperative fisher; uses a gular pouch to scoop, not store, prey." },
            { name: "Swan", sciName: "Cygnus olor", family: "Anatidae", clue: "Territorial waterfowl; historically owned by the British monarch." },
            { name: "Flamingo", sciName: "Phoenicopterus roseus", family: "Phoenicopteridae", clue: "Filter-feeds upside down; color is derived from brine shrimp pigments." },
            { name: "Stork", sciName: "Ciconia ciconia", family: "Ciconiidae", clue: "Mute migrant; communicates by clattering its bill during nest displays." },
            { name: "Mandarin Duck", sciName: "Aix galericulata", family: "Anatidae", clue: "Perching duck; symbol of wedded bliss in East Asian culture." }
        ]
    },
    {
        emoji: "🦜", name: "Exotic Birds",
        animals: [
            { name: "Macaw", sciName: "Ara macao", displayLatin: "Tribe: Arini", family: "Psittacidae", clue: "Neotropical giant; consumes clay licks to neutralize toxins in seeds." },
            { name: "Toucan", sciName: "Ramphastos toco", family: "Ramphastidae", clue: "Neotropical frugivore; massive bill helps regulate body heat." },
            { name: "Peacock", sciName: "Pavo cristatus", family: "Phasianidae", clue: "Sexual selection icon; distinct train feathers rattle to attract mates." },
            { name: "Hummingbird", sciName: "Archilochus colubris", family: "Trochilidae", clue: "High metabolism requires torpor at night; only bird capable of hovering." },
            { name: "Parrot", sciName: "Psittacus erithacus", family: "Psittacidae", clue: "Cognitive powerhouse; demonstrates reasoning skills equal to a young child." },
            { name: "Ibis", sciName: "Eudocimus ruber", family: "Threskiornithidae", clue: "Gregarious wader; uses a long, curved bill to probe mud for crustaceans." }
        ]
    },
    {
        emoji: "🐦", name: "Songbirds", 
        animals: [
            { name: "Robin", sciName: "Erithacus rubecula", family: "Muscicapidae", clue: "Garden territorialist; follows large herbivores (or gardeners) to find disturbed worms." },
            { name: "Blue Jay", sciName: "Cyanocitta cristata", family: "Corvidae", clue: "Intelligent hoarder; plants thousands of oak trees annually by forgetting caches." },
            { name: "Java Sparrow", sciName: "Padda oryzivora", family: "Estrildidae", clue: "Social flock bird; originally a rice pest, now a popular cage bird." },
            { name: "Crow", sciName: "Corvus corone", family: "Corvidae", clue: "Tool maker; holds 'funerals' to learn about threats in the area." },
            { name: "Nicobar Pigeon", sciName: "Caloenas nicobarica", family: "Columbidae", clue: "Island nomad; possesses a distinct gizzard stone for grinding hard seeds." },
            { name: "Cardinal", sciName: "Cardinalis cardinalis", displayLatin: "Family: Cardinalidae", family: "Order: Passeriformes", clue: "Non-migratory territory defender; males feed females seeds during courtship." }
        ]
    },
    {
        emoji: "🦃", name: "Ground Birds", 
        animals: [
            { name: "Ostrich", sciName: "Struthio camelus", family: "Struthionidae", clue: "Fastest runner on two legs; possesses two toes to reduce friction." },
            { name: "Emu", sciName: "Dromaius novaehollandiae", family: "Dromaiidae", clue: "Nomadic forager; males incubate the eggs and raise the chicks alone." },
            { name: "Cassowary", sciName: "Casuarius casuarius", family: "Casuariidae", clue: "Keystone rainforest gardener; swallows massive fruit whole." },
            { name: "Turkey", sciName: "Meleagris gallopavo", family: "Phasianidae", clue: "Forest forager; males form coalitions to court females." },
            { name: "Roadrunner", sciName: "Geococcyx californianus", family: "Cuculidae", clue: "Ground cuckoo; cooperatively hunts to kill venomous vipers." },
            { name: "Kiwi", sciName: "Apteryx mantelli", family: "Apterygidae", clue: "Honorary mammal; nostrils are located at the very tip of the beak." }
        ]
    },
    // --- REPTILES & AQUATIC ---
    {
        emoji: "🐊", name: "Reptiles",
        animals: [
            { 
                name: "Crocodile", 
                sciName: "Crocodylus niloticus", 
                displayLatin: "Order: Crocodylia", // Bottom Line
                family: "Clade: Archosauria",      // Top Line
                clue: "Living fossil; capable of slowing heart rate to a few beats per minute." 
            },
            { name: "Cobra", sciName: "Ophiophagus hannah", family: "Elapidae", clue: "Elapid intimidation; expands cervical ribs when threatened." },
            { name: "Tortoise", sciName: "Chelonoidis", family: "Testudinidae", clue: "Land-dwelling tank; water storage allows survival on arid islands." },
            { name: "Iguana", sciName: "Iguana iguana", displayLatin: "Family: Iguanidae", family: "Order: Squamata", clue: "Arboreal swimmer; possesses a photosensory 'third eye' on its head." },
            { name: "Komodo Dragon", sciName: "Varanus komodoensis", displayLatin: "Family: Varanidae", family: "Varanidae", clue: "Island gigantism example; capable of pathogenesis (virgin birth)." },
            { name: "Boa", sciName: "Boa constrictor", displayLatin: "Family: Boidae", family: "Order: Squamata", clue: "Ambush hunter; oxygenates blood independently to breathe while squeezing prey." },
            { name: "Chameleon", sciName: "Chamaeleo chamaeleon", displayLatin: "Suborder: Iguania", family: "Order: Squamata", clue: "Ballistic tongue projector; eyes move independently for 360-degree vision." }
        ]
    },
    {
        emoji: "🐸", name: "Amphibians",
        animals: [
            { name: "Bullfrog", sciName: "Lithobates catesbeianus", family: "Ranidae", clue: "Ambush predator; males battle physically for dominance of the pond." },
            { name: "Toad", sciName: "Bufo bufo", family: "Bufonidae", clue: "Terrestrial hopper; lacks teeth and swallows using its eyeballs." },
            { name: "Salamander", sciName: "Salamandra salamandra", displayLatin: "Order: Urodela", family: "Class: Amphibia", clue: "Permeable skin breather; toxic secretions deter predators." },
            { name: "Axolotl", sciName: "Ambystoma mexicanum", family: "Ambystomatidae", clue: "Neotenic salamander; possesses incredible limb regeneration abilities." },
            { name: "Frog (Tree)", sciName: "Agalychnis callidryas", family: "Hylidae", clue: "Arboreal acrobat; sleeps on the underside of leaves to hide bright colors." }
        ]
    },
    {
        emoji: "🐬", name: "Marine",
        animals: [
            { name: "Whale", sciName: "Balaenoptera musculus", family: "Balaenopteridae", clue: "Largest animal to have ever lived; feeds on the smallest prey." },
            { name: "Dolphin", sciName: "Tursiops truncatus", displayLatin: "Infraorder: Cetacea", family: "Order: Artiodactyla", clue: "Sleeps one brain hemisphere at a time; recognized by unique dorsal fins." },
            { name: "Shark", sciName: "Carcharodon carcharias", family: "Lamnidae", clue: "Apex predator; relies on a fatty liver for buoyancy rather than a swim bladder." },
            { name: "Octopus", sciName: "Octopus vulgaris", displayLatin: "Order: Octopoda", family: "Phylum: Mollusca", clue: "Problem solving invertebrate; skin contains chromatophores for instant camouflage." },
            { name: "Seal", sciName: "Phoca vitulina", family: "Phocidae", clue: "Coastal pinniped; lacks external ear flaps and moves by flopping on land." },
            { name: "Crab", sciName: "Callinectes sapidus", family: "Portunidae", clue: "Decapod scavenger; molts its hard exoskeleton to grow." }
        ]
    },
    {
        emoji: "🐠", name: "Fish",
        animals: [
            { name: "Goldfish", sciName: "Carassius auratus", family: "Cyprinidae", clue: "Domesticated carp; capable of surviving in freezing, low-oxygen water." },
            { name: "Salmon", sciName: "Salmo salar", displayLatin: "Order: Salmoniformes", family: "Class: Actinopterygii", clue: "Semelparous navigator; undergoes massive physiological changes from salt to fresh water." },
            { name: "Clownfish", sciName: "Amphiprion ocellaris", family: "Pomacentridae", clue: "Protandrous hermaphrodite; all are born male and the dominant turns female." },
            { name: "Seahorse", sciName: "Hippocampus guttulatus", family: "Syngnathidae", clue: "Poor swimmer; lacks a stomach and must eat constantly." },
            { name: "Piranha", sciName: "Pygocentrus nattereri", family: "Serrasalmidae", clue: "River scavenger; barks when threatened and rarely attacks healthy animals." }
        ]
    },
    {
        emoji: "🦋", name: "Insects+",
        animals: [
            { name: "Butterfly", sciName: "Danaus plexippus", family: "Nymphalidae", clue: "Migratory specialist; navigates via sun compass over thousands of miles." },
            { name: "Blue Carpenter Bee", sciName: "Xylocopa caerulea", family: "Apidae", clue: "Solitary buzzer; excavates nesting tunnels in dead wood." },
            { name: "Tarantula", sciName: "Brachypelma", family: "Theraphosidae", clue: "Long-lived ambusher; relies on vibrations rather than a web to hunt." },
            { name: "Scorpion", sciName: "Pandinus imperator", displayLatin: "Clade: Arachnopulmonata", family: "Class: Arachnida", clue: "Ancient arachnid; gives birth to live young that ride on her back." },
            { name: "Snail", sciName: "Cornu aspersum", family: "Helicidae", clue: "Gastropod grazer; estivates in a mucus seal during dry periods." },
            { name: "Mantis", sciName: "Mantis religiosa", displayLatin: "Order: Mantodea", family: "Class: Insecta", clue: "Visual hunter; only insect capable of 3D vision." }
        ]
    }
];