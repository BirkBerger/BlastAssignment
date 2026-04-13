import GameChart from './components/GameChart';
import { LogParser } from '@/lib/LogParser';
import ScoreBoard from './components/ScoreBoard';

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
            <main className="">
                <div>
                    <h1>
                        Hello world
                    </h1>
                    <GameChart data={data}></GameChart>
                    <ScoreBoard data={data}></ScoreBoard>
                </div>
            </main>
        </div>
    );
}

export default Home;
