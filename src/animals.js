// src/data/animals.js

export const ANIMAL_GROUPS = [
    // --- CARNIVORES ---
    {
        emoji: "🐺", name: "Canines",
        animals: [
            { name: "Wolf", emoji: "🐺", sciName: "Canis lupus", family: "Canidae", clue: "Apex social hunter; legendary ancestor of man's best friend." },
            { name: "Coyote", emoji: "🐺", sciName: "Canis latrans", family: "Canidae", clue: "Opportunistic trickster; expanded its range while other predators retreated." },
            { name: "Fox", emoji: "🦊", sciName: "Vulpes vulpes", family: "Canidae", clue: "Solitary omnivore; hunts with a unique diving pounce into snow or grass." },
            { name: "Dingo", emoji: "🐕", sciName: "Canis lupus dingo", displayLatin: "Canis familiaris (var.)", family: "Canidae", clue: "Golden-coated apex predator introduced to an island continent millennia ago." },
            { name: "Wild Dog", emoji: "🐕", sciName: "Lycaon pictus", family: "Canidae", clue: "Highly social cursorial hunter; votes on pack movements with sneezes." },
            { name: "Jackal", emoji: "🐕", sciName: "Canis aureus", family: "Canidae", clue: "Opportunistic scavenger; mated pairs hold territory in the scrublands." }
        ]
    },
    {
        emoji: "🦁", name: "Felines",
        animals: [
            { name: "Lion", emoji: "🦁", sciName: "Panthera leo", displayLatin: "Felis leo", family: "Felidae", clue: "The only social feline; dominant males defend the pride's territory." },
            { name: "Tiger", emoji: "🐅", sciName: "Panthera tigris", displayLatin: "Felis tigris", family: "Felidae", clue: "Largest of the big cats; a solitary swimmer that stalks the jungle." },
            { name: "Leopard", emoji: "🐆", sciName: "Panthera pardus", family: "Felidae", clue: "Master of stealth; hauls heavy prey high into trees to protect it from scavengers." },
            { name: "Cheetah", emoji: "🐆", sciName: "Acinonyx jubatus", family: "Felidae", clue: "Sacrificed fighting power for pure acceleration; cannot roar." },
            { name: "Jaguar", emoji: "🐆", sciName: "Panthera onca", family: "Felidae", clue: "A swimmer that kills with a skull-crushing bite rather than a throat hold." },
            { name: "Snow Leopard", emoji: "🐆", sciName: "Panthera uncia", family: "Felidae", clue: "Solitary high-altitude stalker; uses a massive tail for warmth and balance." },
            { name: "Cougar", emoji: "🦁", sciName: "Puma concolor", family: "Felidae", clue: "Wide-ranging ambush predator; holds the record for the most common names." }
        ]
    },
    {
        emoji: "🐻", name: "Bears",
        animals: [
            { name: "Bear (Brown)", emoji: "🐻", sciName: "Ursus arctos", family: "Ursidae", clue: "Shoulder-humped giant; gorges in autumn to survive winter dormancy." },
            { name: "Bear (Polar)", emoji: "🐻‍❄️", sciName: "Ursus maritimus", family: "Ursidae", clue: "Hyper-carnivorous maritime wanderer; black skin absorbs the arctic sun." },
            { name: "Panda", emoji: "🐼", sciName: "Ailuropoda melanoleuca", family: "Ursidae", clue: "Technically a carnivore, but eats a distinct grass; has a 'false thumb'." },
            { name: "Bear (Black)", emoji: "🐻", sciName: "Ursus americanus", family: "Ursidae", clue: "Forest climber; highly adaptable diet ranges from berries to human refuse." },
            { name: "Bear (Sun)", emoji: "🐻", sciName: "Helarctos malayanus", family: "Ursidae", clue: "Smallest of the family; possesses an exceptionally long tongue for extracting honey." }
        ]
    },
    {
        emoji: "🦡", name: "Weasels & Badgers", 
        animals: [
            { name: "Wolverine", emoji: "🦡", sciName: "Gulo gulo", family: "Mustelidae", clue: "Stocky scavenger of the north; famously fearless against much larger predators." },
            { name: "Badger", emoji: "🦡", sciName: "Meles meles", family: "Mustelidae", clue: "Fossorial engineer; constructs massive underground networks passed down for generations." },
            { name: "Honey Badger", emoji: "🦡", sciName: "Mellivora capensis", family: "Mustelidae", clue: "Notoriously thick-skinned; metabolizes venom and surrenders to no one." },
            { name: "Stoat", emoji: "🦦", sciName: "Mustela erminea", family: "Mustelidae", clue: "Performs a mesmerizing 'war dance' to distract prey before striking." },
            { name: "Ferret (Black-footed)", emoji: "🦦", sciName: "Mustela nigripes", family: "Mustelidae", clue: "Once thought extinct; obligate predator of prairie dwelling rodents." }
        ]
    },
    // --- PRIMATES ---
    {
        emoji: "🐒", name: "Primates",
        animals: [
            { name: "Gorilla", emoji: "🦍", sciName: "Gorilla beringei", displayLatin: "G. beringei", family: "Hominidae", clue: "Gentle herbivore of the jungle; troops are led by a gray-haired male." },
            { name: "Chimpanzee", emoji: "🐒", sciName: "Pan troglodytes", family: "Hominidae", clue: "Expert tool-user; hunts colobus monkeys in coordinated groups." },
            { name: "Orangutan", emoji: "🦧", sciName: "Pongo", family: "Hominidae", clue: "Solitary arboreal giant; name translates to 'Person of the Forest'." },
            { name: "Lemur", emoji: "🐒", sciName: "Lemur catta", displayLatin: "Infraorder: Lemuriformes", family: "Suborder: Strepsirrhini", clue: "Prosimian island dweller; uses stink-fights to settle disputes." },
            { name: "Baboon", emoji: "🐒", sciName: "Papio anubis", family: "Cercopithecidae", clue: "Highly aggressive terrestrial forager; complex social hierarchy." },
            { name: "Mandrill", emoji: "🐒", sciName: "Mandrillus sphinx", displayLatin: "Simia sphinx", family: "Cercopithecidae", clue: "World's largest monkey; cryptic forest dweller with vibrant skin coloration." }
        ]
    },
    // --- HERBIVORES ---
    {
        emoji: "🐘", name: "Savanna Giants", 
        animals: [
            { name: "Giraffe", emoji: "🦒", sciName: "Giraffa camelopardalis", displayLatin: "Family: Giraffidae", family: "Order: Artiodactyla", clue: "Tallest terrestrial browser; possesses a specialized valve to prevent fainting when drinking." },
            { name: "Zebra", emoji: "🦓", sciName: "Equus quagga", family: "Equidae", clue: "Equine grazer; visual pattern disrupts predators and deters biting flies." },
            { name: "Elephant", emoji: "🐘", sciName: "Loxodonta africana", family: "Order: Proboscidea", clue: "Ecosystem engineer; mourns its dead and communicates via infrasound." },
            { name: "Rhino", emoji: "🦏", sciName: "Ceratotherium simum", family: "Order: Perissodactyla", clue: "Near-sighted grazer; heavily poached for its keratin nose ornament." },
            { name: "Warthog", emoji: "🐗", sciName: "Phacochoerus africanus", family: "Suidae", clue: "Sleeps in burrows; enters backward to defend the entrance with facial tusks." },
            { name: "Bison", emoji: "🦬", sciName: "Bison bison", displayLatin: "Subfamily: Bovinae", family: "Bovidae", clue: "Keystone species; creates wallows that retain water for the prairie ecosystem." },
            { name: "Camel", emoji: "🐫", sciName: "Camelus dromedarius", family: "Camelidae", clue: "Ship of the desert; stores fat, not water, in its humps." },
            { name: "Llama", emoji: "🦙", sciName: "Lama glama", family: "Camelidae", clue: "High-altitude pack animal; defends itself by spitting regurgitated stomach contents." }
        ]
    },
    {
        emoji: "🌲", name: "Forest Grazers", 
        animals: [
            { name: "Moose", emoji: "🫎", sciName: "Alces alces", family: "Cervidae", clue: "Largest of the deer family; dives underwater to graze on aquatic vegetation." },
            { name: "Deer (Red)", emoji: "🦌", sciName: "Cervus elaphus", family: "Cervidae", clue: "Forest monarch; males roar during the autumn rut to secure a harem." },
            { name: "Elk", emoji: "🦌", sciName: "Cervus canadensis", family: "Cervidae", clue: "High-altitude grazer; distinctive ivory teeth were once prized as jewelry." },
            { name: "Tapir", emoji: "🐗", sciName: "Tapirus terrestris", displayLatin: "Family: Tapiridae", family: "Order: Perissodactyla", clue: "Ancient odd-toed ungulate; disperses seeds in the neotropical understory." },
            { name: "Okapi", emoji: "🦒", sciName: "Okapia johnstoni", displayLatin: "Family: Giraffidae", family: "Giraffidae", clue: "Elusive rainforest dweller; famous for its long, prehensile blue tongue." },
            { name: "Sloth", emoji: "🦥", sciName: "Bradypus variegatus", family: "Order: Pilosa", clue: "Metabolism is so slow it hosts a mossy ecosystem in its fur." }
        ]
    },
    {
        emoji: "🌊", name: "River Mammals", 
        animals: [
            { name: "Beaver", emoji: "🦫", sciName: "Castor fiber", family: "Castoridae", clue: "Iron-reinforced teeth; radically alters landscapes to create moats." }, 
            { name: "Capybara", emoji: "🐗", sciName: "Hydrochoerus hydrochaeris", family: "Caviidae", clue: "Gregarious semi-aquatic giant; often seen with other birds sitting on it." },
            { name: "Platypus", emoji: "🦆", sciName: "Ornithorhynchus anatinus", family: "Order: Monotremata", clue: "Bio-fluorescent monotreme; detects electric fields with a sensitive bill." },
            { name: "Hippo", emoji: "🦛", sciName: "Hippopotamus amphibius", displayLatin: "Family: Hippopotamidae", family: "Suborder: Whippomorpha", clue: "Responsible for more human fatalities in Africa than lions; secretes red sunscreen." },
            { name: "Otter", emoji: "🦦", sciName: "Lutra lutra", family: "Mustelidae", clue: "Uses rocks as anvils to crack shellfish; sleeps holding hands to stay anchored." },
            { name: "Manatee", emoji: "🦭", sciName: "Trichechus manatus", displayLatin: "Order: Sirenia", family: "Trichechidae", clue: "Slow-moving grazer; sensitive vibrissae cover its entire body." }
        ]
    },
    {
        emoji: "🦌", name: "Antelopes",
        animals: [
            { name: "Wildebeest", emoji: "🐂", sciName: "Connochaetes taurinus", family: "Bovidae", clue: "Keystone migrator; calves can run minutes after birth to keep up with the mega-herd." },
            { name: "Impala", emoji: "🦌", sciName: "Aepyceros melampus", family: "Bovidae", clue: "Ubiquitous prey species; distinguishes itself with a unique 'M' marking on the rear." },
            { name: "Gazelle", emoji: "🦌", sciName: "Eudorcas thomsonii", family: "Bovidae", clue: "Delicate arid sprinter; performs vertical leaps to signal fitness to predators." },
            { name: "Oryx", emoji: "🦌", sciName: "Oryx gazella", displayLatin: "Subfamily: Antilopinae", family: "Bovidae", clue: "Desert survivor; can raise its body temperature to 46°C to avoid sweating." },
            { name: "Kudu", emoji: "🦌", sciName: "Tragelaphus strepsiceros", family: "Bovidae", clue: "Woodland browser; famously elusive 'Grey Ghost' capable of clearing 2.5m fences." },
            { name: "Springbok", emoji: "🦌", sciName: "Antidorcas marsupialis", family: "Bovidae", clue: "Arid specialist; namesake of a famous rugby team and known for stiff-legged leaps." }
        ]
    },
    {
        emoji: "🐭", name: "Small Mammals", 
        animals: [
            { name: "Jerboa", emoji: "🐭", sciName: "Jaculus", family: "Dipodidae", clue: "Bipedal desert rodent; extracts all necessary water from its food." },
            { name: "Chipmunk", emoji: "🐿️", sciName: "Tamias striatus", family: "Sciuridae", clue: "Ground-dwelling sciurid; excavates complex burrows with hidden entrances." },
            { name: "Giant Squirrel", emoji: "🐿️", sciName: "Ratufa indica", family: "Sciuridae", clue: "Canopy dweller; builds large globe-shaped nests high in the trees." },
            { name: "Rabbit", emoji: "🐇", sciName: "Oryctolagus cuniculus", family: "Leporidae", clue: "Practice coprophagy (re-eating pellets) to extract maximum nutrients." },
            { name: "Hedgehog", emoji: "🦔", sciName: "Erinaceus europaeus", family: "Erinaceidae", clue: "Immune to many snake venoms; uses anointing behavior to scent its spines." },
            { name: "Raccoon", emoji: "🦝", sciName: "Procyon lotor", family: "Procyonidae", clue: "Highly dexterous tactile specialist; 'sees' with its wet front paws." },      
            { name: "Skunk", emoji: "🦨", sciName: "Mephitis mephitis", family: "Mephitidae", clue: "Aposematic coloring warns of its potent sulfur-based defense spray." }, 
            { name: "Meerkat", emoji: "🐿️", sciName: "Suricata suricatta", family: "Herpestidae", clue: "Eusocial mongoose; teaches young how to safely handle scorpions." },
            { name: "Bat", emoji: "🦇", sciName: "Tadarida brasiliensis", family: "Order: Chiroptera", clue: "The only mammal capable of powered flight; comprises 20% of all mammal species." },
            { name: "Armadillo", emoji: "🐗", sciName: "Dasypus novemcinctus", family: "Order: Cingulata", clue: "New World digger; gives birth to identical quadruplets." }
        ]
    },
    {
        emoji: "🦘", name: "Marsupials",
        animals: [
            { name: "Kangaroo", emoji: "🦘", sciName: "Macropus rufus", family: "Macropodidae", clue: "Uses tail as a third leg; cannot move its hind legs independently on land." },
            { name: "Koala", emoji: "🐨", sciName: "Phascolarctos cinereus", family: "Phascolarctidae", clue: "Specialized folivore; brain is smooth because energy is conserved for digestion." },
            { name: "Sugar Glider", emoji: "🐿️", sciName: "Petaurus breviceps", family: "Petauridae", clue: "Sap-loving nocturnal marsupial; volplanes between trees in family groups." }, 
            { name: "Opossum", emoji: "🐀", sciName: "Didelphis virginiana", family: "Didelphidae", clue: "North America's only marsupial; immune to pit viper venom and eats thousands of ticks." },
            { name: "Wombat", emoji: "🐻", sciName: "Vombatus ursinus", displayLatin: "Suborder: Vombatiformes", family: "Order: Diprotodontia", clue: "Fossorial grazer; crushes predators' skulls against the burrow roof with its rump." }
        ]
    },
    // --- BIRDS ---
    {
        emoji: "🦅", name: "Raptors",
        animals: [
            { name: "Eagle", emoji: "🦅", sciName: "Haliaeetus leucocephalus", family: "Accipitridae", clue: "Kleptoparasite; often steals food from other birds despite its majestic reputation." },
            { name: "Owl", emoji: "🦉", sciName: "Tyto alba", family: "Tytonidae", clue: "Silent flight feathers; ears are asymmetrical to pinpoint prey in total darkness." },
            { name: "Hawk", emoji: "🦅", sciName: "Buteo jamaicensis", family: "Accipitridae", clue: "Ubiquitous soarer; highly variable plumage makes identification difficult." },
            { name: "Falcon", emoji: "🦅", sciName: "Falco peregrinus", displayLatin: "Genus: Falco", family: "Order: Falconiformes", clue: "Specialized bird-hunter; kills mid-air with a 'tomial tooth' beak notch." },
            { name: "Vulture", emoji: "🦅", sciName: "Cathartes aura", family: "Cathartidae", clue: "Uses strong stomach acid to sanitize the environment; finds food by smell." },
            { name: "Osprey", emoji: "🦅", sciName: "Pandion haliaetus", family: "Pandionidae", clue: "Cosmopolitan raptor; the only one that plunges feet-first into water." }
        ]
    },
    {
        emoji: "🦆", name: "Water Birds",
        animals: [
            { name: "Penguin", emoji: "🐧", sciName: "Aptenodytes forsteri", family: "Spheniscidae", clue: "Southern hemisphere diver; males incubate the egg on their feet for months." },
            { name: "Pelican", emoji: "🪶", sciName: "Pelecanus occidentalis", family: "Pelecanidae", clue: "Cooperative fisher; uses a gular pouch to scoop, not store, prey." },
            { name: "Swan", emoji: "🦢", sciName: "Cygnus olor", family: "Anatidae", clue: "Territorial waterfowl; historically owned by the British monarch." },
            { name: "Flamingo", emoji: "🦩", sciName: "Phoenicopterus roseus", family: "Phoenicopteridae", clue: "Filter-feeds upside down; color is derived from brine shrimp pigments." },
            { name: "Stork", emoji: "🦢", sciName: "Ciconia ciconia", family: "Ciconiidae", clue: "Mute migrant; communicates by clattering its bill during nest displays." },
            { name: "Mandarin Duck", emoji: "🦆", sciName: "Aix galericulata", family: "Anatidae", clue: "Perching duck; symbol of wedded bliss in East Asian culture." }
        ]
    },
    {
        emoji: "🦜", name: "Exotic Birds",
        animals: [
            { name: "Macaw", emoji: "🦜", sciName: "Ara macao", displayLatin: "Tribe: Arini", family: "Psittacidae", clue: "Neotropical giant; consumes clay licks to neutralize toxins in seeds." },
            { name: "Toucan", emoji: "🦜", sciName: "Ramphastos toco", family: "Ramphastidae", clue: "Neotropical frugivore; massive bill helps regulate body heat." },
            { name: "Peacock", emoji: "🦚", sciName: "Pavo cristatus", family: "Phasianidae", clue: "Sexual selection icon; distinct train feathers rattle to attract mates." },
            { name: "Hummingbird", emoji: "🐦", sciName: "Archilochus colubris", family: "Trochilidae", clue: "High metabolism requires torpor at night; only bird capable of hovering." },
            { name: "Parrot", emoji: "🦜", sciName: "Psittacus erithacus", family: "Psittacidae", clue: "Cognitive powerhouse; demonstrates reasoning skills equal to a young child." },
            { name: "Ibis", emoji: "🪶", sciName: "Eudocimus ruber", family: "Threskiornithidae", clue: "Gregarious wader; uses a long, curved bill to probe mud for crustaceans." }
        ]
    },
    {
        emoji: "🐦", name: "Songbirds", 
        animals: [
            { name: "Robin", emoji: "🐦", sciName: "Erithacus rubecula", family: "Muscicapidae", clue: "Garden territorialist; follows large herbivores (or gardeners) to find disturbed worms." },
            { name: "Blue Jay", emoji: "🐦", sciName: "Cyanocitta cristata", family: "Corvidae", clue: "Intelligent hoarder; plants thousands of oak trees annually by forgetting caches." },
            { name: "Java Sparrow", emoji: "🐦", sciName: "Padda oryzivora", family: "Estrildidae", clue: "Social flock bird; originally a rice pest, now a popular cage bird." },
            { name: "Crow", emoji: "🐦‍⬛", sciName: "Corvus corone", family: "Corvidae", clue: "Tool maker; holds 'funerals' to learn about threats in the area." },
            { name: "Nicobar Pigeon", emoji: "🐦", sciName: "Caloenas nicobarica", family: "Columbidae", clue: "Island nomad; possesses a distinct gizzard stone for grinding hard seeds." },
            { name: "Cardinal", emoji: "🐦", sciName: "Cardinalis cardinalis", displayLatin: "Family: Cardinalidae", family: "Order: Passeriformes", clue: "Non-migratory territory defender; males feed females seeds during courtship." }
        ]
    },
    {
        emoji: "🦃", name: "Ground Birds", 
        animals: [
            { name: "Ostrich", emoji: "🐦", sciName: "Struthio camelus", family: "Struthionidae", clue: "Fastest runner on two legs; possesses two toes to reduce friction." },
            { name: "Emu", emoji: "🐦", sciName: "Dromaius novaehollandiae", family: "Dromaiidae", clue: "Nomadic forager; males incubate the eggs and raise the chicks alone." },
            { name: "Cassowary", emoji: "🐦", sciName: "Casuarius casuarius", family: "Casuariidae", clue: "Keystone rainforest gardener; swallows massive fruit whole." },
            { name: "Turkey", emoji: "🦃", sciName: "Meleagris gallopavo", family: "Phasianidae", clue: "Forest forager; males form coalitions to court females." },
            { name: "Roadrunner", emoji: "🐦", sciName: "Geococcyx californianus", family: "Cuculidae", clue: "Ground cuckoo; cooperatively hunts to kill venomous vipers." },
            { name: "Kiwi", emoji: "🥝", sciName: "Apteryx mantelli", family: "Apterygidae", clue: "Honorary mammal; nostrils are located at the very tip of the beak." },
            { name: "Rooster", emoji: "🐓", sciName: "Gallus gallus", family: "Phasianidae", clue: "Barnyard alarm clock; displays prominent wattles and comb." }
        ]
    },
    // --- REPTILES & AQUATIC ---
    {
        emoji: "🐊", name: "Reptiles",
        animals: [
            { 
                name: "Crocodile", emoji: "🐊",
                sciName: "Crocodylus niloticus", 
                displayLatin: "Order: Crocodylia", 
                family: "Clade: Archosauria",      
                clue: "Living fossil; capable of slowing heart rate to a few beats per minute." 
            },
            { name: "Alligator", emoji: "🐊", sciName: "Alligator mississippiensis", family: "Alligatoridae", clue: "New World crocodilian; snout is U-shaped compared to the V-shape of its cousins." },
            { name: "Cobra", emoji: "🐍", sciName: "Ophiophagus hannah", family: "Elapidae", clue: "Elapid intimidation; expands cervical ribs when threatened." },
            { name: "Tortoise", emoji: "🐢", sciName: "Chelonoidis", family: "Testudinidae", clue: "Land-dwelling tank; water storage allows survival on arid islands." },
            { name: "Iguana", emoji: "🦎", sciName: "Iguana iguana", displayLatin: "Family: Iguanidae", family: "Order: Squamata", clue: "Arboreal swimmer; possesses a photosensory 'third eye' on its head." },
            { name: "Komodo Dragon", emoji: "🐉", sciName: "Varanus komodoensis", displayLatin: "Family: Varanidae", family: "Varanidae", clue: "Island gigantism example; capable of pathogenesis (virgin birth)." },
            { name: "Boa", emoji: "🐍", sciName: "Boa constrictor", displayLatin: "Family: Boidae", family: "Order: Squamata", clue: "Ambush hunter; oxygenates blood independently to breathe while squeezing prey." },
            { name: "Chameleon", emoji: "🦎", sciName: "Chamaeleo chamaeleon", displayLatin: "Suborder: Iguania", family: "Order: Squamata", clue: "Ballistic tongue projector; eyes move independently for 360-degree vision." },
            { name: "Gecko", emoji: "🦎", sciName: "Gekkonidae", family: "Gekkonidae", clue: "Sticky-footed climber; interacts with surfaces using Van der Waals forces." }
        ]
    },
    {
        emoji: "🐸", name: "Amphibians",
        animals: [
            { name: "Bullfrog", emoji: "🐸", sciName: "Lithobates catesbeianus", family: "Ranidae", clue: "Ambush predator; males battle physically for dominance of the pond." },
            { name: "Toad", emoji: "🐸", sciName: "Bufo bufo", family: "Bufonidae", clue: "Terrestrial hopper; lacks teeth and swallows using its eyeballs." },
            { name: "Salamander", emoji: "🦎", sciName: "Salamandra salamandra", displayLatin: "Order: Urodela", family: "Class: Amphibia", clue: "Permeable skin breather; toxic secretions deter predators." },
            { name: "Axolotl", emoji: "🦎", sciName: "Ambystoma mexicanum", family: "Ambystomatidae", clue: "Neotenic salamander; possesses incredible limb regeneration abilities." },
            { name: "Frog (Tree)", emoji: "🐸", sciName: "Agalychnis callidryas", family: "Hylidae", clue: "Arboreal acrobat; sleeps on the underside of leaves to hide bright colors." },
            { name: "Newt", emoji: "🦎", sciName: "Pleurodelinae", family: "Salamandridae", clue: "Semi-aquatic salamander; some species secrete potent neurotoxins from their skin." }
        ]
    },
    {
        emoji: "🐬", name: "Marine",
        animals: [
            { name: "Whale", emoji: "🐋", sciName: "Balaenoptera musculus", family: "Balaenopteridae", clue: "Largest animal to have ever lived; feeds on the smallest prey." },
            { name: "Orca", emoji: "🐋", sciName: "Orcinus orca", family: "Delphinidae", clue: "Wolf of the sea; apex predator that hunts in sophisticated matrilineal pods." },
            { name: "Dolphin", emoji: "🐬", sciName: "Tursiops truncatus", displayLatin: "Infraorder: Cetacea", family: "Order: Artiodactyla", clue: "Sleeps one brain hemisphere at a time; recognized by unique dorsal fins." },
            { name: "Shark", emoji: "🦈", sciName: "Carcharodon carcharias", family: "Lamnidae", clue: "Apex predator; relies on a fatty liver for buoyancy rather than a swim bladder." },
            { name: "Octopus", emoji: "🐙", sciName: "Octopus vulgaris", displayLatin: "Order: Octopoda", family: "Phylum: Mollusca", clue: "Problem solving invertebrate; skin contains chromatophores for instant camouflage." },
            { name: "Squid", emoji: "🦑", sciName: "Teuthida", family: "Teuthida", clue: "Fast-moving cephalopod; uses jet propulsion and ink clouds to escape." },
            { name: "Seal", emoji: "🦭", sciName: "Phoca vitulina", family: "Phocidae", clue: "Coastal pinniped; lacks external ear flaps and moves by flopping on land." },
            { name: "Walrus", emoji: "🦭", sciName: "Odobenus rosmarus", family: "Odobenidae", clue: "Arctic giant; uses massive tusks to haul itself onto ice floes." },
            { name: "Crab", emoji: "🦀", sciName: "Callinectes sapidus", family: "Portunidae", clue: "Decapod scavenger; molts its hard exoskeleton to grow." },
            { name: "Lobster", emoji: "🦞", sciName: "Homarus americanus", family: "Nephropidae", clue: "Bottom-dwelling crustacean; biologically immortal and tastes with its legs." },
            { name: "Shrimp", emoji: "🦐", sciName: "Caridea", family: "Caridea", clue: "Decapod scavenger; the pistol variety can snap its claw to create a shockwave." },
            { name: "Jellyfish", emoji: "🪼", sciName: "Scyphozoa", family: "Cnidaria", clue: "Brainless drifter; uses nematocysts to sting prey upon contact." },
            { name: "Starfish", emoji: "⭐", sciName: "Asteroidea", family: "Asteroidea", clue: "Echinoderm; regenerates entire limbs and eats by extruding its stomach." }
        ]
    },
    {
        emoji: "🐠", name: "Fish",
        animals: [
            { name: "Goldfish", emoji: "🐟", sciName: "Carassius auratus", family: "Cyprinidae", clue: "Domesticated carp; capable of surviving in freezing, low-oxygen water." },
            { name: "Salmon", emoji: "🐟", sciName: "Salmo salar", displayLatin: "Order: Salmoniformes", family: "Class: Actinopterygii", clue: "Semelparous navigator; undergoes massive physiological changes from salt to fresh water." },
            { name: "Clownfish", emoji: "🐠", sciName: "Amphiprion ocellaris", family: "Pomacentridae", clue: "Protandrous hermaphrodite; all are born male and the dominant turns female." },
            { name: "Seahorse", emoji: "🎠", sciName: "Hippocampus guttulatus", family: "Syngnathidae", clue: "Poor swimmer; lacks a stomach and must eat constantly." },
            { name: "Piranha", emoji: "🐟", sciName: "Pygocentrus nattereri", family: "Serrasalmidae", clue: "River scavenger; barks when threatened and rarely attacks healthy animals." }
        ]
    },
    {
        emoji: "🦋", name: "Insects+",
        animals: [
            { name: "Butterfly", emoji: "🦋", sciName: "Danaus plexippus", family: "Nymphalidae", clue: "Migratory specialist; navigates via sun compass over thousands of miles." },
            { name: "Blue Carpenter Bee", emoji: "🐝", sciName: "Xylocopa caerulea", family: "Apidae", clue: "Solitary buzzer; excavates nesting tunnels in dead wood." },
            { name: "Ladybug", emoji: "🐞", sciName: "Coccinellidae", family: "Coccinellidae", clue: "Gardener's friend; voracious predator of aphids." },
            { name: "Ant", emoji: "🐜", sciName: "Formicidae", family: "Formicidae", clue: "Eusocial engineer; capable of carrying many times its own body weight." },
            { name: "Tarantula", emoji: "🕷️", sciName: "Brachypelma", family: "Theraphosidae", clue: "Long-lived ambusher; relies on vibrations rather than a web to hunt." },
            { name: "Scorpion", emoji: "🦂", sciName: "Pandinus imperator", displayLatin: "Clade: Arachnopulmonata", family: "Class: Arachnida", clue: "Ancient arachnid; gives birth to live young that ride on her back." },
            { name: "Snail", emoji: "🐌", sciName: "Cornu aspersum", family: "Helicidae", clue: "Gastropod grazer; estivates in a mucus seal during dry periods." },
            { name: "Mantis", emoji: "🦗", sciName: "Mantis religiosa", displayLatin: "Order: Mantodea", family: "Class: Insecta", clue: "Visual hunter; only insect capable of 3D vision." },
            { name: "Beetle", emoji: "🪲", sciName: "Coleoptera", family: "Coleoptera", clue: "Armored insect; the most biodiverse group of animals on Earth." },
            { name: "Dragonfly", emoji: "🚁", sciName: "Anisoptera", family: "Odonata", clue: "Aerial ace; catches prey mid-air with a 95% success rate." },
            { name: "Grasshopper", emoji: "🦗", sciName: "Caelifera", family: "Orthoptera", clue: "Jumping herbivore; organs for hearing are located on its abdomen." },
            { name: "Mosquito", emoji: "🦟", sciName: "Culicidae", family: "Culicidae", clue: "Deadliest animal on Earth; only the females bite to nourish their eggs." },
            { name: "Fly", emoji: "🪰", sciName: "Musca domestica", family: "Muscidae", clue: "Acrobatic scavenger; tastes food with its feet and vomits enzymes to digest it." },
            { name: "Caterpillar", emoji: "🐛", sciName: "Lepidoptera", family: "Lepidoptera", clue: "Larval stage; eats constantly to fuel a complete metamorphic transformation." },
            { name: "Worm", emoji: "🪱", sciName: "Lumbricus terrestris", family: "Lumbricidae", clue: "Soil aerator; breathes through its skin and has five heart-like arches." }
        ]
    }
];