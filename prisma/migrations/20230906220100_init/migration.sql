-- CreateTable
CREATE TABLE "Spotify" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Spotify_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Spotify_name_key" ON "Spotify"("name");
