import GameChart from './components/GameChart';
import { LogParser } from '@/lib/LogParser';
import ScoreBoard from './components/ScoreBoard';
import { Suspense } from 'react';

async function Home() {

    const data = await fetch(
        'https://blast-recruiting.s3.eu-central-1.amazonaws.com/NAVIvsVitaGF-Nuke.txt',
        { next: {
            revalidate: 3600 // cache for 1 hour
        }}
    ).then((res) => res.text())
    .then((raw) => new LogParser(raw).getData());

    return (
        <div className="">
            <main className="m-12 flex flex-col items-center">
                <div className="max-w-[1000px] w-full">
                    <Suspense fallback={null}>
                        <ScoreBoard data={data}></ScoreBoard>
                    </Suspense>
                    {/* <GameChart data={data}></GameChart> */}
                </div>
            </main>
        </div>
    );
}

export default Home;
