import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOCK_MOVIES = [
  {
    id: 'dune-part-two',
    title: 'Dune: Part Two',
    synopsis:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, striving to prevent a catastrophic future only he can foresee.',
    duration: 166,
    releaseYear: 2024,
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    rating: 8.6,
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    directors: ['Denis Villeneuve'],
    isFeatured: true,
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    synopsis:
      "When Earth becomes uninhabitable, a team of seasoned explorers travels through a newly discovered wormhole in space in an attempt to ensure humanity's long-term survival.",
    duration: 169,
    releaseYear: 2014,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    rating: 8.7,
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    directors: ['Christopher Nolan'],
    isFeatured: false,
  },
  {
    id: 'deadpool-wolverine',
    title: 'Deadpool & Wolverine',
    synopsis:
      'A listless Wade Wilson toils in civilian life. But when his homeworld faces an existential threat, he must reluctantly suit-up and convince a very grumpy Wolverine to join him.',
    duration: 128,
    releaseYear: 2024,
    posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    rating: 7.7,
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    directors: ['Shawn Levy'],
    isFeatured: false,
  },
  {
    id: 'everything-everywhere',
    title: 'Everything Everywhere All at Once',
    synopsis:
      'An aging Chinese immigrant is swept up in an insane adventure, in which she alone can save the world by exploring other universes linking with the lives she could have led.',
    duration: 139,
    releaseYear: 2022,
    posterUrl: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    rating: 8.7,
    genres: ['Sci-Fi', 'Action', 'Comedy', 'Drama'],
    directors: ['Daniel Kwan', 'Daniel Scheinert'],
    isFeatured: false,
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    synopsis:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, and the political fallout that followed.',
    duration: 180,
    releaseYear: 2023,
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    rating: 8.9,
    genres: ['Drama', 'History', 'Thriller'],
    directors: ['Christopher Nolan'],
    isFeatured: false,
  },
  {
    id: 'the-batman',
    title: 'The Batman',
    synopsis:
      "When a serial killer leaves cryptic clues targeting Gotham City's elite, Batman is forced into an investigation that reveals a vast conspiracy behind his city's criminal underworld.",
    duration: 176,
    releaseYear: 2022,
    posterUrl: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    rating: 7.8,
    genres: ['Action', 'Crime', 'Thriller'],
    directors: ['Matt Reeves'],
    isFeatured: false,
  },
];

const SEAT_ROWS = ['A', 'B', 'C', 'D'] as const;
const SEAT_COLS = 8;
const THEATER_NAME = 'IMAX Screen 1';
const SHOWTIME_ID = 'Tomorrow-8:30PM-IMAX';
const USER_ID = 'portfolio-user';

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records (with dependency ordering)
  console.log('🧹 Cleaning existing tables...');
  await prisma.bookingSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.showTime.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.aIRecommendationCache.deleteMany();
  await prisma.watchHistory.deleteMany();
  await prisma.userAIPreference.deleteMany();
  await prisma.user.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.director.deleteMany();

  // 2. Create default portfolio user
  console.log('👤 Creating default portfolio user...');
  const user = await prisma.user.create({
    data: {
      id: USER_ID,
      email: 'portfolio@flixmate.dev',
      name: 'FlixMate Reviewer',
      passwordHash: '$2b$10$EP01yR9.3M1750r7n9n8nu5xIux6YlR2aF3e0n4aP72aF3e0n4aP7', // dummy hash
      role: 'USER',
      aiPreference: {
        create: {
          preferredGenres: ['Sci-Fi', 'Adventure'],
          preferredViewAngle: 0.0,
          preferredDistanceRatio: 0.65,
        },
      },
    },
  });

  // 3. Create genres and directors and movies
  console.log('🎬 Seeding movies, genres, and directors...');
  for (const movieData of MOCK_MOVIES) {
    await prisma.movie.create({
      data: {
        id: movieData.id,
        title: movieData.title,
        synopsis: movieData.synopsis,
        duration: movieData.duration,
        releaseDate: new Date(`${movieData.releaseYear}-01-01`),
        posterUrl: movieData.posterUrl,
        trailerUrl: movieData.trailerUrl,
        averageRating: movieData.rating,
        isFeatured: movieData.isFeatured,
        genres: {
          connectOrCreate: movieData.genres.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
        directors: {
          connectOrCreate: movieData.directors.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });
  }

  // 4. Create seats for the theater
  console.log('🪑 Seeding theater seats...');
  const seatsData = SEAT_ROWS.flatMap((row, rowIndex) =>
    Array.from({ length: SEAT_COLS }, (_, colIndex) => {
      const col = colIndex + 1;
      const id = `${row}-${col}`;
      const distanceRatio = (rowIndex + 1) / 4;
      const viewAngle = parseFloat(((colIndex - 3.5) / 3.5).toFixed(2));

      return {
        id,
        theaterName: THEATER_NAME,
        seatNumber: `${row}${col}`,
        row,
        col,
        type: row === 'D' ? ('VIP' as const) : ('STANDARD' as const),
        viewAngleScore: viewAngle,
        distanceRatioScore: distanceRatio,
      };
    })
  );

  for (const seat of seatsData) {
    await prisma.seat.create({
      data: seat,
    });
  }

  // 5. Seed a tomorrow showtime
  console.log('📅 Seeding showtime schedule...');
  const startTime = new Date();
  startTime.setDate(startTime.getDate() + 1);
  startTime.setHours(20, 30, 0, 0); // 8:30 PM

  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 166); // Dune 2 duration (166 min)

  const showTime = await prisma.showTime.create({
    data: {
      id: SHOWTIME_ID,
      movieId: 'dune-part-two',
      startTime,
      endTime,
      theaterName: THEATER_NAME,
      price: 15.5,
    },
  });

  // 6. Seed mock watch history for the recommendation engine to use
  console.log('🧠 Seeding user watch history...');
  await prisma.watchHistory.createMany({
    data: [
      {
        userId: USER_ID,
        movieId: 'interstellar',
        completionRate: 1.0,
        explicitRating: 5.0,
      },
      {
        userId: USER_ID,
        movieId: 'oppenheimer',
        completionRate: 0.9,
        explicitRating: 4.5,
      },
    ],
  });

  // 7. Seed initial pre-booked seats (low capacity defaults: A4, B5, C3)
  console.log('🔒 Seeding default reserved seats to prevent concurrent booking...');
  const bookedSeats = ['A-4', 'B-5', 'C-3'];
  const simulationBooking = await prisma.booking.create({
    data: {
      userId: USER_ID,
      showTimeId: SHOWTIME_ID,
      totalPrice: 15.5 * bookedSeats.length,
      status: 'CONFIRMED',
    },
  });

  await prisma.bookingSeat.createMany({
    data: bookedSeats.map((seatId) => ({
      bookingId: simulationBooking.id,
      showTimeId: SHOWTIME_ID,
      seatId,
    })),
  });

  console.log('✨ Seeding complete! Database is ready.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
