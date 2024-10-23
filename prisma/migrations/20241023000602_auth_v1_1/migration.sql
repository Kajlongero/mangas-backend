-- CreateTable
CREATE TABLE "_authToroles" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_authToroles_AB_unique" ON "_authToroles"("A", "B");

-- CreateIndex
CREATE INDEX "_authToroles_B_index" ON "_authToroles"("B");

-- AddForeignKey
ALTER TABLE "_authToroles" ADD CONSTRAINT "_authToroles_A_fkey" FOREIGN KEY ("A") REFERENCES "auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_authToroles" ADD CONSTRAINT "_authToroles_B_fkey" FOREIGN KEY ("B") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
