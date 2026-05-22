import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { DeezerService, MusicTrack } from '../services/deezer.service';
import { FavoritesService } from '../services/favorites.service';
import { ProfileStateService } from '../services/profile-state.service';
import { TrackPlayerComponent } from '../track-player/track-player.component';

interface RouletteGenre {
  name: string;
  vibe: string;
  classics: RoulettePick[];
  wildcards: RoulettePick[];
}

interface RoulettePick {
  query: string;
  label: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CommonModule,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonTitle,
    IonToolbar,
    TrackPlayerComponent,
  ],
})
export class Tab1Page {
  readonly avatar$ = inject(ProfileStateService).avatar$;
  randomTrack?: MusicTrack;
  isRolling = false;
  rollError = '';
  winnerGenre?: RouletteGenre;
  winnerPick?: RoulettePick;
  activeGenreIndex = 1;
  visibleGenres: RouletteGenre[] = [];

  readonly genres: RouletteGenre[] = [
    {
      name: 'pop',
      vibe: 'Coro mundial',
      classics: [
        { query: 'Michael Jackson Billie Jean', label: 'Clásico pop' },
        { query: 'Michael Jackson Beat It', label: 'Rey del pop' },
        { query: 'Michael Jackson Thriller', label: 'Clásico mundial' },
        { query: 'Lady Gaga Bad Romance', label: 'Icono pop' },
        { query: 'Lady Gaga Poker Face', label: 'Hit 2000s' },
        { query: 'Madonna Like A Prayer', label: 'Pop legendario' },
        { query: 'Madonna Hung Up', label: 'Dance pop' },
        { query: 'The Weeknd Blinding Lights', label: 'Hit global' },
        { query: 'The Weeknd Starboy', label: 'Pop oscuro' },
        { query: 'The Weeknd Save Your Tears', label: 'Coro seguro' },
        { query: 'Dua Lipa Levitating', label: 'Pop moderno' },
        { query: 'Dua Lipa Dont Start Now', label: 'Disco pop' },
        { query: 'Katy Perry Firework', label: 'Todos la cantan' },
        { query: 'Katy Perry Dark Horse', label: 'Pop gigante' },
        { query: 'Taylor Swift Shake It Off', label: 'Pop masivo' },
        { query: 'Taylor Swift Anti Hero', label: 'Hit moderno' },
        { query: 'Ariana Grande 7 rings', label: 'Pop viral' },
        { query: 'Ariana Grande Into You', label: 'Pop brillante' },
        { query: 'Harry Styles As It Was', label: 'Pop actual' },
        { query: 'Billie Eilish bad guy', label: 'Pop alternativo' },
        { query: 'Olivia Rodrigo drivers license', label: 'Drama pop' },
        { query: 'Bruno Mars Just The Way You Are', label: 'Coro romántico' },
        { query: 'Rihanna Umbrella', label: 'Hit eterno' },
        { query: 'Rihanna Diamonds', label: 'Pop elegante' },
      ],
      wildcards: [
        { query: 'M83 Midnight City', label: 'Sorpresa popular' },
        { query: 'Foster The People Pumped Up Kicks', label: 'Indie conocido' },
        { query: 'Carly Rae Jepsen Call Me Maybe', label: 'Pop pegajoso' },
        { query: 'Sia Chandelier', label: 'Voz gigante' },
        { query: 'Miley Cyrus Flowers', label: 'Hit reciente' },
        { query: 'Tones And I Dance Monkey', label: 'Viral mundial' },
      ],
    },
    {
      name: 'rock',
      vibe: 'Guitarras legendarias',
      classics: [
        { query: 'Queen Bohemian Rhapsody', label: 'Himno rock' },
        { query: 'Queen Another One Bites The Dust', label: 'Bajo clásico' },
        { query: 'Queen We Will Rock You', label: 'Estadio total' },
        { query: 'Nirvana Smells Like Teen Spirit', label: 'Clásico noventero' },
        { query: 'Nirvana Come As You Are', label: 'Grunge clásico' },
        { query: 'The Killers Mr Brightside', label: 'Coro seguro' },
        { query: 'The Killers Somebody Told Me', label: 'Rock 2000s' },
        { query: 'Bon Jovi Livin On A Prayer', label: 'Arena rock' },
        { query: 'Linkin Park In The End', label: 'Rock 2000s' },
        { query: 'Linkin Park Numb', label: 'Rock emocional' },
        { query: 'ACDC Back In Black', label: 'Riff eterno' },
        { query: 'ACDC Highway To Hell', label: 'Rock clásico' },
        { query: 'Guns N Roses Sweet Child O Mine', label: 'Guitarra famosa' },
        { query: 'Guns N Roses Welcome To The Jungle', label: 'Hard rock' },
        { query: 'Red Hot Chili Peppers Californication', label: 'Alt rock' },
        { query: 'Red Hot Chili Peppers Otherside', label: 'Clásico alternativo' },
        { query: 'Foo Fighters Everlong', label: 'Rock intenso' },
        { query: 'Green Day Boulevard Of Broken Dreams', label: 'Punk pop' },
        { query: 'Muse Supermassive Black Hole', label: 'Rock espacial' },
        { query: 'Radiohead Creep', label: 'Himno alternativo' },
      ],
      wildcards: [
        { query: 'Arctic Monkeys Do I Wanna Know', label: 'Rock alternativo' },
        { query: 'The Strokes Reptilia', label: 'Sorpresa popular' },
        { query: 'Franz Ferdinand Take Me Out', label: 'Indie rock' },
        { query: 'Paramore Misery Business', label: 'Pop punk' },
        { query: 'Evanescence Bring Me To Life', label: 'Rock dramático' },
        { query: 'System Of A Down Chop Suey', label: 'Metal famoso' },
      ],
    },
    {
      name: 'latino',
      vibe: 'Fiesta conocida',
      classics: [
        { query: 'Daddy Yankee Gasolina', label: 'Reggaetón clásico' },
        { query: 'Shakira Hips Dont Lie', label: 'Hit mundial' },
        { query: 'Shakira Whenever Wherever', label: 'Pop latino' },
        { query: 'Shakira Waka Waka', label: 'Mundial total' },
        { query: 'Luis Fonsi Despacito', label: 'Pop cultura' },
        { query: 'Bad Bunny Titi Me Pregunto', label: 'Latino global' },
        { query: 'Bad Bunny Moscow Mule', label: 'Verano latino' },
        { query: 'Bad Bunny Yo Perreo Sola', label: 'Perreo global' },
        { query: 'Enrique Iglesias Bailando', label: 'Coro latino' },
        { query: 'J Balvin Mi Gente', label: 'Fiesta global' },
        { query: 'Maluma Felices Los 4', label: 'Urbano pop' },
        { query: 'Karol G Tusa', label: 'Hit latino' },
        { query: 'Karol G Provenza', label: 'Relax latino' },
        { query: 'Rauw Alejandro Todo De Ti', label: 'Pop urbano' },
        { query: 'Rosalia Despecha', label: 'Rumba moderna' },
        { query: 'Juanes La Camisa Negra', label: 'Clásico latino' },
        { query: 'Mana Rayando El Sol', label: 'Rock latino' },
        { query: 'Soda Stereo De Musica Ligera', label: 'Himno latino' },
        { query: 'Marc Anthony Vivir Mi Vida', label: 'Salsa famosa' },
        { query: 'Celia Cruz La Vida Es Un Carnaval', label: 'Salsa eterna' },
      ],
      wildcards: [
        { query: 'Bomba Estereo To My Love', label: 'Sorpresa latina' },
        { query: 'Monsieur Perine Nuestra Cancion', label: 'Joyita popular' },
        { query: 'Calle 13 Latinoamerica', label: 'Latino profundo' },
        { query: 'Chayanne Torero', label: 'Baile clásico' },
        { query: 'Don Omar Danza Kuduro', label: 'Fiesta segura' },
        { query: 'Proyecto Uno El Tiburon', label: 'Retro fiesta' },
      ],
    },
    {
      name: 'reggaetón',
      vibe: 'Perreo conocido',
      classics: [
        { query: 'Daddy Yankee Dura', label: 'Perreo pop' },
        { query: 'Daddy Yankee Rompe', label: 'Clásico urbano' },
        { query: 'Don Omar Virtual Diva', label: 'Reggaetón clásico' },
        { query: 'Don Omar Pobre Diabla', label: 'Vieja escuela' },
        { query: 'Wisin Y Yandel Rakata', label: 'Dúo legendario' },
        { query: 'Wisin Y Yandel Abusadora', label: 'Urbano 2000s' },
        { query: 'Nicky Jam El Perdon', label: 'Reggaetón romántico' },
        { query: 'Nicky Jam Hasta El Amanecer', label: 'Coro urbano' },
        { query: 'Ozuna Se Preparo', label: 'Hit urbano' },
        { query: 'Ozuna Baila Baila Baila', label: 'Fiesta urbana' },
        { query: 'J Balvin Ginza', label: 'Perreo global' },
        { query: 'J Balvin Safari', label: 'Urbano fino' },
        { query: 'Anuel AA Ella Quiere Beber', label: 'Trap urbano' },
        { query: 'Feid Feliz Cumpleanos Ferxxo', label: 'Ferxxo mood' },
        { query: 'Myke Towers La Playa', label: 'Urbano suave' },
      ],
      wildcards: [
        { query: 'Plan B Candy', label: 'Clásico intenso' },
        { query: 'Tego Calderon Pa Que Retozen', label: 'Vieja escuela' },
        { query: 'Ivy Queen Quiero Bailar', label: 'Reina urbana' },
        { query: 'Chencho Corleone Un Cigarrillo', label: 'Perreo lento' },
        { query: 'Bad Bunny Safaera', label: 'Random explosivo' },
      ],
    },
    {
      name: 'electro',
      vibe: 'Festival mode',
      classics: [
        { query: 'Daft Punk One More Time', label: 'Clásico dance' },
        { query: 'Daft Punk Get Lucky', label: 'Funk electrónico' },
        { query: 'Daft Punk Around The World', label: 'Loop eterno' },
        { query: 'Avicii Wake Me Up', label: 'Festival hit' },
        { query: 'Avicii Levels', label: 'EDM legendario' },
        { query: 'Avicii The Nights', label: 'Coro festival' },
        { query: 'Calvin Harris Feel So Close', label: 'EDM conocido' },
        { query: 'Calvin Harris Summer', label: 'Verano EDM' },
        { query: 'Calvin Harris This Is What You Came For', label: 'Pop dance' },
        { query: 'David Guetta Titanium Sia', label: 'Hit global' },
        { query: 'David Guetta Memories Kid Cudi', label: 'Fiesta electrónica' },
        { query: 'Swedish House Mafia Dont You Worry Child', label: 'Mainstage' },
        { query: 'Martin Garrix Animals', label: 'Drop famoso' },
        { query: 'Zedd Clarity', label: 'EDM vocal' },
        { query: 'Zedd The Middle', label: 'Dance pop' },
        { query: 'Alan Walker Faded', label: 'Electro viral' },
        { query: 'Marshmello Alone', label: 'EDM gamer' },
        { query: 'The Chainsmokers Closer', label: 'Pop electrónico' },
        { query: 'Major Lazer Lean On', label: 'Dancehall electro' },
        { query: 'Clean Bandit Rather Be', label: 'Electro pop' },
      ],
      wildcards: [
        { query: 'Disclosure Latch Sam Smith', label: 'Sorpresa dance' },
        { query: 'Madeon Pop Culture', label: 'Joyita electro' },
        { query: 'Porter Robinson Shelter', label: 'Electro emocional' },
        { query: 'Skrillex Bangarang', label: 'Dubstep famoso' },
        { query: 'Deadmau5 Strobe', label: 'Progresivo clásico' },
        { query: 'Eric Prydz Opus', label: 'Viaje electrónico' },
      ],
    },
    {
      name: 'hip hop',
      vibe: 'Barras icónicas',
      classics: [
        { query: 'Eminem Lose Yourself', label: 'Himno rap' },
        { query: 'Eminem Without Me', label: 'Rap famoso' },
        { query: 'Eminem The Real Slim Shady', label: 'Clásico rap' },
        { query: 'Drake Hotline Bling', label: 'Pop rap' },
        { query: 'Drake Gods Plan', label: 'Hit global' },
        { query: 'Drake One Dance', label: 'Dance rap' },
        { query: 'Kendrick Lamar HUMBLE', label: 'Rap moderno' },
        { query: 'Kendrick Lamar DNA', label: 'Barras fuertes' },
        { query: 'Kendrick Lamar Alright', label: 'Himno moderno' },
        { query: 'OutKast Hey Ya', label: 'Todos la topan' },
        { query: 'OutKast Ms Jackson', label: 'Rap sureño' },
        { query: 'Coolio Gangstas Paradise', label: 'Clásico rap' },
        { query: 'Snoop Dogg Drop It Like Its Hot', label: 'West Coast' },
        { query: 'Tupac California Love', label: 'Clásico oeste' },
        { query: '50 Cent In Da Club', label: 'Fiesta rap' },
        { query: 'Jay Z Empire State Of Mind', label: 'Rap elegante' },
        { query: 'Kanye West Stronger', label: 'Rap electro' },
        { query: 'Travis Scott Sicko Mode', label: 'Trap gigante' },
        { query: 'Post Malone Rockstar', label: 'Trap pop' },
      ],
      wildcards: [
        { query: 'Kid Cudi Day N Nite', label: 'Sorpresa popular' },
        { query: 'Macklemore Thrift Shop', label: 'Random conocido' },
        { query: 'Missy Elliott Get Ur Freak On', label: 'Flow clásico' },
        { query: 'Nelly Hot In Herre', label: 'Party rap' },
        { query: 'Akon Smack That', label: 'Pop rap 2000s' },
        { query: 'Lil Nas X Industry Baby', label: 'Rap viral' },
      ],
    },
    {
      name: 'indie',
      vibe: 'Alternativo famoso',
      classics: [
        { query: 'Tame Impala The Less I Know The Better', label: 'Indie global' },
        { query: 'Tame Impala Let It Happen', label: 'Psicodélico' },
        { query: 'MGMT Kids', label: 'Clasico indie' },
        { query: 'MGMT Electric Feel', label: 'Indie dance' },
        { query: 'Gorillaz Feel Good Inc', label: 'Alternativo iconico' },
        { query: 'Gorillaz Clint Eastwood', label: 'Alt clásico' },
        { query: 'The Neighbourhood Sweater Weather', label: 'Hit indie' },
        { query: 'Gotye Somebody That I Used To Know', label: 'One hit gigante' },
        { query: 'Arctic Monkeys 505', label: 'Indie emocional' },
        { query: 'Arctic Monkeys I Wanna Be Yours', label: 'Indie viral' },
        { query: 'Cage The Elephant Cigarette Daydreams', label: 'Suave indie' },
        { query: 'Mac DeMarco Chamber Of Reflection', label: 'Indie chill' },
        { query: 'The 1975 Somebody Else', label: 'Alt pop' },
        { query: 'Vampire Weekend A Punk', label: 'Indie clásico' },
        { query: 'Lorde Royals', label: 'Alt pop global' },
        { query: 'Lana Del Rey Summertime Sadness', label: 'Pop alternativo' },
        { query: 'Twenty One Pilots Stressed Out', label: 'Alt viral' },
      ],
      wildcards: [
        { query: 'Empire Of The Sun Walking On A Dream', label: 'Sorpresa brillante' },
        { query: 'Phoenix 1901', label: 'Joyita conocida' },
        { query: 'Beach House Space Song', label: 'Dream pop' },
        { query: 'Clairo Sofia', label: 'Indie suave' },
        { query: 'Rex Orange County Loving Is Easy', label: 'Indie feliz' },
        { query: 'Wallows Are You Bored Yet', label: 'Indie moderno' },
      ],
    },
    {
      name: 'k-pop',
      vibe: 'Coreos virales',
      classics: [
        { query: 'BTS Dynamite', label: 'K-pop global' },
        { query: 'BTS Butter', label: 'Pop brillante' },
        { query: 'BTS Boy With Luv', label: 'Hit mundial' },
        { query: 'BLACKPINK Ddu Du Ddu Du', label: 'Girl crush' },
        { query: 'BLACKPINK Kill This Love', label: 'K-pop intenso' },
        { query: 'BLACKPINK How You Like That', label: 'Drop famoso' },
        { query: 'NewJeans Super Shy', label: 'K-pop cute' },
        { query: 'NewJeans OMG', label: 'Viral suave' },
        { query: 'TWICE Fancy', label: 'Coreo pop' },
        { query: 'TWICE The Feels', label: 'K-pop disco' },
        { query: 'PSY Gangnam Style', label: 'Viral histórico' },
        { query: 'Stray Kids Gods Menu', label: 'K-pop fuerte' },
        { query: 'IVE I AM', label: 'Pop épico' },
        { query: 'LE SSERAFIM Antifragile', label: 'Hit moderno' },
      ],
      wildcards: [
        { query: 'Red Velvet Psycho', label: 'K-pop elegante' },
        { query: 'EXO Love Shot', label: 'Clásico moderno' },
        { query: 'SEVENTEEN Super', label: 'Coreo poderosa' },
        { query: 'aespa Next Level', label: 'Futuro pop' },
        { query: 'Jungkook Seven', label: 'Solo global' },
      ],
    },
    {
      name: 'anime',
      vibe: 'Opening famoso',
      classics: [
        { query: 'LiSA Gurenge', label: 'Demon Slayer' },
        { query: 'LiSA Crossing Field', label: 'SAO clásico' },
        { query: 'Aimer Zankyosanka', label: 'Anime hit' },
        { query: 'YOASOBI Idol', label: 'Oshi no Ko' },
        { query: 'Eve Kaikai Kitan', label: 'Jujutsu Kaisen' },
        { query: 'TK Unravel', label: 'Tokyo Ghoul' },
        { query: 'Asian Kung Fu Generation Haruka Kanata', label: 'Naruto' },
        { query: 'Kana Boon Silhouette', label: 'Naruto Shippuden' },
        { query: 'Linked Horizon Guren No Yumiya', label: 'Attack on Titan' },
        { query: 'Hiroyuki Sawano Vogel im Kafig', label: 'Épico anime' },
        { query: 'Yui Again', label: 'Fullmetal' },
        { query: 'Kenshi Yonezu Peace Sign', label: 'My Hero Academia' },
      ],
      wildcards: [
        { query: 'Flow Colors', label: 'Code Geass' },
        { query: 'Orange Range Asterisk', label: 'Bleach' },
        { query: 'Blue Bird Ikimonogakari', label: 'Naruto clásico' },
        { query: 'Bump Of Chicken Hello World', label: 'Anime rock' },
        { query: 'Kessoku Band Seishun Complex', label: 'Bocchi vibe' },
      ],
    },
    {
      name: 'lo-fi',
      vibe: 'Chill para pensar',
      classics: [
        { query: 'lofi hip hop beats to relax study', label: 'Study mood' },
        { query: 'Nujabes Feather', label: 'Lo-fi clásico' },
        { query: 'Nujabes Aruarian Dance', label: 'Chill eterno' },
        { query: 'Jinsang Affection', label: 'Lo-fi suave' },
        { query: 'Jinsang Bliss', label: 'Chill beat' },
        { query: 'Idealism Both Of Us', label: 'Study beat' },
        { query: 'Idealism Controlla', label: 'Beat relajado' },
        { query: 'potsu just friends', label: 'Lo-fi popular' },
        { query: 'Kudasai The Girl I Havent Met', label: 'Lo-fi emocional' },
        { query: 'Tomppabeats Monday Loop', label: 'Beat tranquilo' },
        { query: 'Sleepy Fish Fall Colors', label: 'Chill limpio' },
        { query: 'Kupla Spacesuits', label: 'Lo-fi cálido' },
      ],
      wildcards: [
        { query: 'ChilledCow lofi hip hop', label: 'Radio vibe' },
        { query: 'City Girl Neon Impasse', label: 'Chill nocturno' },
        { query: 'Aso Seasons', label: 'Beat suave' },
        { query: 'SwuM Show Me How', label: 'Lo-fi fresco' },
        { query: 'Wun Two Again', label: 'Jazz hop' },
      ],
    },
    {
      name: 'nostalgia',
      vibe: 'Memoria desbloqueada',
      classics: [
        { query: 'a-ha Take On Me', label: '80s clásico' },
        { query: 'Britney Spears Toxic', label: 'Pop 2000s' },
        { query: 'Britney Spears Baby One More Time', label: 'Pop nostalgia' },
        { query: 'Backstreet Boys I Want It That Way', label: 'Karaoke seguro' },
        { query: 'NSYNC Bye Bye Bye', label: 'Boy band' },
        { query: 'Eurythmics Sweet Dreams', label: 'Clásico mundial' },
        { query: 'Rick Astley Never Gonna Give You Up', label: 'Internet clásico' },
        { query: 'Survivor Eye Of The Tiger', label: 'Motivación retro' },
        { query: 'Europe The Final Countdown', label: 'Final épico' },
        { query: 'Cyndi Lauper Girls Just Want To Have Fun', label: '80s pop' },
        { query: 'Whitney Houston I Wanna Dance With Somebody', label: 'Pop eterno' },
        { query: 'Toto Africa', label: 'Clásico meme' },
        { query: 'Oasis Wonderwall', label: 'Guitarra nostálgica' },
        { query: 'Smash Mouth All Star', label: 'Internet nostalgia' },
        { query: 'Avril Lavigne Complicated', label: '2000s vibe' },
        { query: 'Sean Kingston Beautiful Girls', label: 'Verano 2000s' },
      ],
      wildcards: [
        { query: 'New Radicals You Get What You Give', label: 'Random nostálgico' },
        { query: 'Modjo Lady Hear Me Tonight', label: 'Joyita dance' },
        { query: 'Eiffel 65 Blue Da Ba Dee', label: 'Eurodance raro' },
        { query: 'Las Ketchup Asereje', label: 'Fiesta retro' },
        { query: 'Aqua Barbie Girl', label: 'Pop plástico' },
        { query: 'Lou Bega Mambo No 5', label: 'Retro fiesta' },
      ],
    },
    {
      name: 'random',
      vibe: 'Ruleta rara pero buena',
      classics: [
        { query: 'Pharrell Williams Happy', label: 'Feel good' },
        { query: 'Mark Ronson Uptown Funk Bruno Mars', label: 'Fiesta segura' },
        { query: 'Black Eyed Peas I Gotta Feeling', label: 'Party clásico' },
        { query: 'Black Eyed Peas Pump It', label: 'Energía total' },
        { query: 'Psy Gangnam Style', label: 'Cultura pop' },
        { query: 'Imagine Dragons Believer', label: 'Hit masivo' },
        { query: 'Imagine Dragons Radioactive', label: 'Pop épico' },
        { query: 'Coldplay Viva La Vida', label: 'Himno pop' },
        { query: 'Coldplay A Sky Full Of Stars', label: 'Pop festival' },
        { query: 'OneRepublic Counting Stars', label: 'Coro global' },
        { query: 'Maroon 5 Sugar', label: 'Pop alegre' },
        { query: 'Maroon 5 Moves Like Jagger', label: 'Dance pop' },
        { query: 'Adele Rolling In The Deep', label: 'Voz poderosa' },
        { query: 'Adele Someone Like You', label: 'Balada famosa' },
        { query: 'Ed Sheeran Shape Of You', label: 'Pop gigante' },
        { query: 'Ed Sheeran Perfect', label: 'Romántica global' },
        { query: 'Sam Smith Stay With Me', label: 'Balada pop' },
        { query: 'Hozier Take Me To Church', label: 'Voz intensa' },
      ],
      wildcards: [
        { query: 'Glass Animals Heat Waves', label: 'Random popular' },
        { query: 'Portugal The Man Feel It Still', label: 'Sorpresa conocida' },
        { query: 'Fun We Are Young', label: 'Coro enorme' },
        { query: 'Gotye Somebody That I Used To Know', label: 'One hit gigante' },
        { query: 'Twenty One Pilots Ride', label: 'Alt pop' },
        { query: 'Bastille Pompeii', label: 'Pop alternativo' },
      ],
    },
  ];

  constructor(
    private readonly deezerService: DeezerService,
    public readonly favoritesService: FavoritesService
  ) {
    this.updateVisibleGenres();
  }

  rollTrack(): void {
    if (this.isRolling) {
      return;
    }

    this.isRolling = true;
    this.rollError = '';
    this.randomTrack = undefined;
    this.winnerGenre = undefined;
    this.winnerPick = undefined;

    const targetIndex = Math.floor(Math.random() * this.genres.length);
    const totalSteps = 24 + targetIndex;
    let currentStep = 0;
    let delay = 58;

    const spin = () => {
      this.activeGenreIndex = (this.activeGenreIndex + 1) % this.genres.length;
      this.updateVisibleGenres();
      currentStep += 1;

      if (currentStep < totalSteps) {
        delay += currentStep > 14 ? 32 : 7;
        window.setTimeout(spin, delay);
        return;
      }

      this.activeGenreIndex = targetIndex;
      this.winnerGenre = this.genres[targetIndex];
      this.updateVisibleGenres();
      this.loadWinnerTrack(this.winnerGenre);
    };

    spin();
  }

  toggleFavorite(track: MusicTrack): void {
    this.favoritesService.toggle(track);
  }

  private loadWinnerTrack(genre: RouletteGenre): void {
    const selectedPick = this.getRoulettePick(genre);
    this.winnerPick = selectedPick;

    window.setTimeout(() => {
      this.deezerService.searchTracks(selectedPick.query, 8).subscribe({
        next: (tracks) => {
          if (!tracks.length) {
            this.rollError = 'La ruleta no encontró canciones. Intenta otra vez.';
            this.isRolling = false;
            return;
          }

          this.randomTrack = tracks[0];
          this.isRolling = false;
        },
        error: () => {
          this.rollError = 'No se pudo conectar con Deezer.';
          this.isRolling = false;
        },
      });
    }, 520);
  }

  private getRoulettePick(genre: RouletteGenre): RoulettePick {
    const shouldUseWildcard = Math.random() < 0.18;
    const source = shouldUseWildcard ? genre.wildcards : genre.classics;
    return source[Math.floor(Math.random() * source.length)];
  }

  private updateVisibleGenres(): void {
    const previousIndex = (this.activeGenreIndex - 1 + this.genres.length) % this.genres.length;
    const nextIndex = (this.activeGenreIndex + 1) % this.genres.length;
    this.visibleGenres = [
      this.genres[previousIndex],
      this.genres[this.activeGenreIndex],
      this.genres[nextIndex],
    ];
  }
}
