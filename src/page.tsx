import React from "react"
import cn from "classnames"
import analyze from "rgbaster"
import { useInView } from "react-intersection-observer"
import { usePokemonsQuery, PokemonItem } from "./generated/graphql"
import styles from "./page.module.scss"

type CardProps = {
  pokemon: PokemonItem
}

const Card: React.FC<CardProps> = ({ pokemon }) => {
  const colorRef = React.useRef(null)
  const [isHover, setHover] = React.useState(false)
  const { ref, inView } = useInView({
    rootMargin: "90px",
    triggerOnce: true,
  })

  React.useEffect(() => {
    const anlalyzeImg = async () => {
      const colors = await analyze(pokemon.image)
      colorRef.current = colors[0].color
    }
    anlalyzeImg()
  }, [])

  const getRgb = () => {
    const color = colorRef.current! as string
    if (!color) return [0, 0, 0]

    const matches = color.match(/\d+/g)
    return [parseInt(matches![0], 16), parseInt(matches![1], 16), parseInt(matches![2], 16)]
  }

  const calcComplementaryColor = () => {
    const [red, green, blue] = getRgb()
    return `rgb(${255 - red}, ${255 - green}, ${255 - blue})`
  }

  const onHover = () => {
    document.documentElement.style.setProperty("--overlay-color", colorRef.current)
    document.documentElement.style.setProperty("--name-color", calcComplementaryColor())
    setHover(true)
  }

  return (
    <li
      className={cn(styles.card, { [styles.inView]: inView, [styles.isHover]: isHover })}
      onMouseEnter={onHover}
      onMouseLeave={() => setHover(false)}
      ref={ref}
    >
      <img src={pokemon.image!} className={styles.image} />
      <div className={styles.overlay}>
        <p className={styles.name}>{pokemon.name}</p>
      </div>
    </li>
  )
}

function App() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)
  const nextOffsetRef = React.useRef(0)
  const [pokemons, setPokemons] = React.useState<PokemonItem[]>([])
  const [offset, setOffset] = React.useState(0)
  const [result] = usePokemonsQuery({ variables: { offset } })

  React.useEffect(() => {
    const onScroll = () => {
      const { height: listHeight } = listRef.current!.getBoundingClientRect()
      const { height: containerHeight } = containerRef.current!.getBoundingClientRect()
      const rate = ((containerRef.current!.scrollTop + containerHeight) / listHeight) * 100

      if (rate >= 90) {
        setOffset(nextOffsetRef.current)
      }
    }

    containerRef.current!.addEventListener("scroll", onScroll)

    return () => containerRef.current!.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(() => {
    if (result.fetching || !result.data?.pokemons) return
    setPokemons([...pokemons, ...(result.data.pokemons.results as PokemonItem[])])
    nextOffsetRef.current = result.data!.pokemons!.nextOffset as number
  }, [result.fetching])

  return (
    <main className={styles.container} ref={containerRef}>
      <ul className={styles.grid} ref={listRef}>
        {pokemons.map((pokemon: PokemonItem) => (
          <Card key={pokemon.name} pokemon={pokemon} />
        ))}
      </ul>
    </main>
  )
}

export default App
