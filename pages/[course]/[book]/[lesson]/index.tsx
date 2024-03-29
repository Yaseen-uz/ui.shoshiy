import Container from '@/components/Container'
import { HomeLayout } from '@/components/Layout'
import Logo from '@/components/Logo'
import { TypeCourseLesson, courses } from '@/data'
import Link from 'next/link'
import { useRouter } from 'next/router'

export async function getStaticPaths() {
	return {
		paths: [],
		fallback: 'blocking',
	}
}

export async function getLesson({ bookName, slug }: { bookName: string; slug: string }) {
	const book = courses().find((course) => (course.slug === bookName ? course : false))

	if (!book) {
		throw new Error()
	}

	const res = await fetch(
		`${process.env.NODE_ENV === 'development' ? process.env.URL : 'https://shoshiy-yasiin-uz.vercel.app'}/${book.json}`,
		{ method: 'get' }
	).then((res) => res.json())

	let index = 1

	const lesson = res.items.find((item: any, idx: number) => {
		if (item.contentDetails.videoId === slug) {
			index = idx
			return true
		}
	})

	const prev = res.items[index - 1]
	const next = res.items[index + 1]

	return {
		html: `<iframe width="100%" class='h-[220px] md:h-[350px]' src="https://www.youtube-nocookie.com/embed/${lesson.contentDetails.videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`,
		title: lesson.snippet.title,
		slug: lesson.contentDetails.videoId,
		description: lesson.snippet.description,
		prev: prev ? { title: prev.snippet.title, slug: prev.contentDetails.videoId } : null,
		next: next ? { title: next.snippet.title, slug: next.contentDetails.videoId } : null,
	} satisfies TypeCourseLesson & { description: string; prev: any; next: any }
}

export async function getStaticProps(context: any) {
	try {
		const { book: bookName, lesson: lessonName } = context.params
		const lesson = await getLesson({ bookName, slug: lessonName })

		return {
			props: { lesson },
		}
	} catch (error) {
		return {
			props: { lesson: null },
		}
	}
}

function Article({ lesson }: { lesson: TypeCourseLesson & { description: string; prev: any; next: any } }) {
	const router = useRouter()
	const query = router.query

	if (!lesson) {
		return (
			<HomeLayout>
				<h3 className="h3 flex items-center justify-center pt-10">Bunday kurs mavjud emas 📚</h3>
			</HomeLayout>
		)
	}

	return (
		<Container>
			<header className="flex items-center justify-between py-7 md:py-10">
				<Link
					href={`/${query.course}/${query.book}`}
					className="bg-white/10 rounded-md flex items-center gap-2 justify-between py-1 px-3 active:scale-95 duration-def cursor-pointer select-none"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="w-4 h-4 flex-shrink-0"
					>
						<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
					</svg>

					<p className="p text-sm">Orqaga</p>
				</Link>

				<Link href={'/'}>
					<Logo className="h-5" />
				</Link>
			</header>

			<div
				className="w-full rounded-lg overflow-hidden max-h-[350px]"
				dangerouslySetInnerHTML={{
					__html: lesson.html,
				}}
			/>
			<div className="h-[30px] md:h-[50px]" />

			<h3 className="h1">{lesson.title}</h3>

			<div className="h-[30px]" />

			<div className="h-0.5 w-full bg-white/20" />

			<div className="h-[30px]" />

			<div className="grid md:grid-cols-2 grid-cols-1 gap-7 md:gap-10">
				{lesson.prev ? (
					<Link
						href={`/${router.query.course}/${router.query.book}/${lesson.prev.slug}`}
						className="bg-white/10 rounded-md flex items-center gap-3 justify-between py-3 px-3 active:scale-95 duration-def cursor-pointer select-none"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-4 h-4 flex-shrink-0"
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
						</svg>

						<p className="p">{lesson.prev.title}</p>
					</Link>
				) : (
					<div />
				)}

				{lesson.next ? (
					<Link
						href={`/${router.query.course}/${router.query.book}/${lesson.next.slug}`}
						className="bg-white/10 rounded-md flex items-center gap-3 justify-between py-3 px-3 active:scale-95 duration-def cursor-pointer select-none"
					>
						<p className="p">{lesson.next.title}</p>

						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-4 h-4 rotate-180 flex-shrink-0"
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
						</svg>
					</Link>
				) : (
					<div />
				)}
			</div>

			<div className="h-[30px]" />
		</Container>
	)
}

export default Article
