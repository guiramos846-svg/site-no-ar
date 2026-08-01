'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Plus, Minus, X, MessageCircle, MapPin, Clock,
  Star, Search, ChevronRight, Phone, Instagram, Facebook, ChefHat,
  Flame, Truck, Store, CreditCard, DollarSign, Trash2, ShieldCheck, Utensils
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

const HERO_IMG_FALLBACK = 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=1600&q=80'
const GRILL_IMG = 'https://images.unsplash.com/photo-1712579733874-c3a79f0f9d12?w=1600&q=80'

const fmtBRL = (v) => (Number(v)||0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' })

const DAY_KEYS = ['sun','mon','tue','wed','thu','fri','sat']

function isStoreOpen(settings) {
  if (!settings) return false
  if (settings.manualClosed) return false
  const now = new Date()
  const dayKey = DAY_KEYS[now.getDay()]
  const dayCfg = settings.hours?.[dayKey]
  let openStr = settings.openTime || '10:30'
  let closeStr = settings.closeTime || '14:30'
  if (dayCfg) {
    if (dayCfg.closed) return false
    openStr = dayCfg.open || openStr
    closeStr = dayCfg.close || closeStr
  }
  const [oh, om] = openStr.split(':').map(Number)
  const [ch, cm] = closeStr.split(':').map(Number)
  const mins = now.getHours()*60 + now.getMinutes()
  return mins >= (oh*60+om) && mins <= (ch*60+cm)
}

export default function App() {
  const [settings, setSettings] = useState(null)
  const [products, setProducts] = useState([])
  const [globalAddons, setGlobalAddons] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const [s, p, a] = await Promise.all([
          fetch('/api/settings').then(r=>r.json()),
          fetch('/api/products').then(r=>r.json()),
          fetch('/api/addons').then(r=>r.json()).catch(()=>[]),
        ])
        setSettings(s)
        setProducts(Array.isArray(p) ? p : [])
        setGlobalAddons(Array.isArray(a) ? a : [])
      } catch (e) { console.error(e) }
    })()
    try {
      const c = JSON.parse(localStorage.getItem('cart')||'[]')
      if (Array.isArray(c)) setCart(c)
    } catch {}
  }, [])

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)) }, [cart])

  const open = isStoreOpen(settings)

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category || 'Outros'))
    return Array.from(set)
  }, [products])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return products.filter(p => !q || p.name.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q))
  }, [products, search])

  const subtotal = cart.reduce((s,i)=> s + (i.price + (i.addons||[]).reduce((a,x)=>a+(x.price||0),0)) * i.quantity, 0)

  const addToCart = (product, quantity, addons, notes) => {
    setCart(prev => [...prev, {
      cartId: Math.random().toString(36).slice(2),
      productId: product.id, name: product.name, image: product.image,
      price: product.price, quantity, addons, notes,
    }])
    toast.success(`${product.name} adicionado ao carrinho`)
    setSelectedProduct(null)
  }

  const updateQty = (cartId, delta) => {
    setCart(prev => prev.map(i => i.cartId === cartId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
  }
  const removeItem = (cartId) => setCart(prev => prev.filter(i => i.cartId !== cartId))

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const whatsappHref = settings ? `https://wa.me/${settings.whatsapp}` : '#'

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-neutral-50 to-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-amber-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 to-red-600 flex items-center justify-center shadow-lg shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-black text-base sm:text-lg leading-tight text-neutral-900 truncate">Frango <span className="text-red-600">Dourado</span></div>
              <div className="text-[10px] text-neutral-500 leading-tight hidden sm:block">O melhor frango assado</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Badge className={`text-[10px] sm:text-xs px-2 ${open ? 'bg-green-600 hover:bg-green-600' : 'bg-neutral-500 hover:bg-neutral-500'}`}>
              {open ? 'Aberto' : 'Fechado'}
            </Badge>
            <Button size="sm" variant="outline" className="border-amber-500 text-neutral-900 hover:bg-amber-50 relative h-9 px-3" onClick={()=>setCartOpen(true)}>
              <ShoppingCart className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Carrinho</span>
              {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{cart.reduce((s,i)=>s+i.quantity,0)}</span>}
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={settings?.heroImage || HERO_IMG_FALLBACK} alt="Frango assado" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/40" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-10 sm:py-16 md:py-28 text-center text-white">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.6}}>
            {settings?.heroBadge && (
              <Badge className="bg-amber-400 text-neutral-900 hover:bg-amber-400 mb-3 text-[10px] sm:text-xs">
                <Flame className="w-3 h-3 mr-1" /> {settings.heroBadge}
              </Badge>
            )}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-none">
              {(() => {
                const t = settings?.heroTitle || 'Frango Dourado'
                const parts = t.split(' ')
                if (parts.length >= 2) {
                  const last = parts.pop()
                  return <>{parts.join(' ')} <span className="text-amber-400">{last}</span></>
                }
                return <span className="text-amber-400">{t}</span>
              })()}
            </h1>
            {settings?.heroSubtitle && (
              <p className="mt-3 text-base sm:text-lg md:text-2xl text-amber-50 font-medium">{settings.heroSubtitle}</p>
            )}
            {!open && (
              <div className="mt-4 inline-block bg-red-600 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold">
                🕒 Fora do horário • {settings?.openTime}–{settings?.closeTime}
              </div>
            )}
            <div className="mt-6 grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-3">
              <Button size="lg" onClick={()=>scrollTo('cardapio')} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 sm:px-8 h-12 sm:h-14 text-sm sm:text-base shadow-xl col-span-2 sm:col-span-1">
                <Utensils className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Fazer Pedido
              </Button>
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white h-12 sm:h-14 text-sm sm:text-base">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> WhatsApp
                </Button>
              </a>
              <a href={settings?.mapsUrl || '#'} target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="w-full bg-white/10 border-white text-white hover:bg-white hover:text-neutral-900 backdrop-blur h-12 sm:h-14 text-sm sm:text-base">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Localização
                </Button>
              </a>
            </div>
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-amber-100">
              <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> Seg a Dom • {settings?.openTime}–{settings?.closeTime}</div>
              <div className="hidden sm:flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Atendimento familiar</div>
              <div className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> Entrega rápida</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MENU */}
      <section id="cardapio" className="max-w-6xl mx-auto px-3 sm:px-4 pt-8 sm:pt-12 pb-8 sm:pb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <div className="text-amber-600 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2"><ChefHat className="w-4 h-4"/> Nosso Cardápio</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900">Peça em 2 minutos</h2>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"/>
            <Input placeholder="Buscar produto..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 h-11 bg-white"/>
          </div>
        </div>

        {/* Category quick-nav */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
            {categories.map(c => (
              <button key={c} onClick={()=>document.getElementById(`cat-${c}`)?.scrollIntoView({behavior:'smooth', block:'start'})} className="shrink-0 px-4 h-9 rounded-full bg-white border border-amber-200 hover:bg-amber-50 text-sm font-semibold text-neutral-800">
                {c}
              </button>
            ))}
          </div>
        )}

        {categories.map(cat => {
          const items = filtered.filter(p => (p.category||'Outros') === cat)
          if (!items.length) return null
          return (
            <div key={cat} id={`cat-${cat}`} className="mb-8 sm:mb-10 scroll-mt-20">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-800 mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-1 h-5 sm:h-6 bg-red-600 rounded-full"/> {cat}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
                {items.map(p => (
                  <motion.div key={p.id} whileHover={{y:-2}} className="group">
                    <Card className="overflow-hidden border-neutral-200 hover:border-amber-400 hover:shadow-lg transition-all active:scale-[0.99]" onClick={()=>setSelectedProduct(p)}>
                      <div className="flex gap-3 p-2.5 sm:p-3 cursor-pointer">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg sm:rounded-xl overflow-hidden shrink-0 bg-neutral-100 relative">
                          {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/> : <div className="w-full h-full flex items-center justify-center text-neutral-400"><ChefHat/></div>}
                          {p.featured && <div className="absolute top-1 left-1 bg-amber-400 text-neutral-900 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full">TOP</div>}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="font-bold text-neutral-900 text-sm sm:text-base leading-tight line-clamp-1">{p.name}</div>
                          <div className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 sm:mt-1 line-clamp-2">{p.description}</div>
                          <div className="mt-auto flex items-end justify-between pt-2">
                            <div className="font-black text-red-600 text-base sm:text-lg">{fmtBRL(p.price)}</div>
                            <Button size="sm" onClick={(e)=>{e.stopPropagation(); setSelectedProduct(p)}} className="bg-amber-400 hover:bg-amber-500 text-neutral-900 font-bold h-8 sm:h-9 rounded-full px-3 sm:px-4 text-xs sm:text-sm">
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1"/> <span className="hidden sm:inline">Adicionar</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}

        {!filtered.length && (
          <div className="text-center py-12 text-neutral-500">Nenhum produto encontrado.</div>
        )}
      </section>

      {/* ABOUT / INFO */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-4">
        {[
          { icon: Clock, title: 'Horário', desc: `Seg a Dom • ${settings?.openTime||'10:30'} às ${settings?.closeTime||'14:30'}` },
          { icon: MapPin, title: 'Endereço', desc: settings?.address || 'Rua da Gruta, 18, Vila Viana, Grajaú-MA' },
          { icon: Phone, title: 'Contato', desc: settings?.whatsapp ? `+${settings.whatsapp}` : '' },
        ].map((b,i)=>(
          <Card key={i} className="border-amber-200">
            <CardContent className="p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5"/>
              </div>
              <div>
                <div className="font-bold text-neutral-900">{b.title}</div>
                <div className="text-sm text-neutral-600">{b.desc}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="bg-neutral-900 text-neutral-300 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-red-600 flex items-center justify-center"><Flame className="w-5 h-5 text-white"/></div>
              <div className="font-black text-white text-lg">Frango <span className="text-amber-400">Dourado</span></div>
            </div>
            <p className="text-sm">O melhor frango assado da cidade. Feito com carinho, servido com rapidez.</p>
          </div>
          <div>
            <div className="font-bold text-white mb-2">Contato</div>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {settings?.address}</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4"/> +{settings?.whatsapp}</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4"/> {settings?.openTime} – {settings?.closeTime}</div>
            </div>
          </div>
          <div>
            <div className="font-bold text-white mb-2">Redes sociais</div>
            <div className="flex gap-2">
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-white"/></a>
              {settings?.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-pink-600 hover:bg-pink-700 flex items-center justify-center"><Instagram className="w-5 h-5 text-white"/></a>}
              {settings?.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"><Facebook className="w-5 h-5 text-white"/></a>}
            </div>
            <a href="/admin" className="inline-block mt-4 text-xs text-neutral-500 hover:text-amber-400">Painel Administrativo →</a>
          </div>
        </div>
        <div className="border-t border-neutral-800 py-4 text-center text-xs text-neutral-500">© {new Date().getFullYear()} Frango Dourado. Todos os direitos reservados.</div>
      </footer>

      {/* FLOATING WHATSAPP */}
      <a href={whatsappHref} target="_blank" rel="noreferrer" className={`fixed right-4 sm:right-6 z-40 ${cart.length > 0 ? 'bottom-24 sm:bottom-6' : 'bottom-6'}`}>
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center shadow-2xl animate-pulse">
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white"/>
        </div>
      </a>

      {/* STICKY BOTTOM CART BAR (mobile) */}
      {cart.length > 0 && (
        <motion.div initial={{y:100}} animate={{y:0}} className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white border-t border-amber-200 shadow-2xl p-3">
          <Button onClick={()=>setCartOpen(true)} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg flex items-center justify-between px-4">
            <span className="flex items-center gap-2">
              <span className="bg-white text-red-600 rounded-full w-7 h-7 flex items-center justify-center font-black text-sm">{cart.reduce((s,i)=>s+i.quantity,0)}</span>
              Ver carrinho
            </span>
            <span className="font-black">{fmtBRL(subtotal)} <ChevronRight className="inline w-5 h-5 ml-1"/></span>
          </Button>
        </motion.div>
      )}

      {/* PRODUCT DIALOG */}
      <ProductDialog product={selectedProduct} globalAddons={globalAddons} onClose={()=>setSelectedProduct(null)} onAdd={addToCart}/>

      {/* CART SHEET */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Seu Carrinho</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!cart.length && <div className="text-center text-neutral-500 py-12">Carrinho vazio</div>}
            {cart.map(item => {
              const itemPrice = item.price + (item.addons||[]).reduce((a,x)=>a+(x.price||0),0)
              return (
                <div key={item.cartId} className="flex gap-3 border rounded-xl p-2">
                  {item.image && <img src={item.image} className="w-16 h-16 rounded-lg object-cover"/>}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{item.name}</div>
                    {item.addons?.length > 0 && <div className="text-xs text-neutral-500">+ {item.addons.map(a=>a.name).join(', ')}</div>}
                    {item.notes && <div className="text-xs italic text-neutral-500">Obs: {item.notes}</div>}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={()=>updateQty(item.cartId, -1)}><Minus className="w-3 h-3"/></Button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={()=>updateQty(item.cartId, 1)}><Plus className="w-3 h-3"/></Button>
                      </div>
                      <div className="font-bold text-red-600 text-sm">{fmtBRL(itemPrice * item.quantity)}</div>
                    </div>
                  </div>
                  <button onClick={()=>removeItem(item.cartId)} className="text-neutral-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                </div>
              )
            })}
          </div>
          {cart.length > 0 && (
            <div className="border-t p-4 space-y-3 bg-neutral-50">
              <div className="flex justify-between font-bold text-lg">
                <span>Subtotal</span><span className="text-red-600">{fmtBRL(subtotal)}</span>
              </div>
              <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-base" onClick={()=>{ setCartOpen(false); setCheckoutOpen(true) }}>
                Finalizar Pedido <ChevronRight className="w-5 h-5 ml-1"/>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* CHECKOUT DIALOG */}
      <CheckoutDialog
        open={checkoutOpen}
        onClose={()=>setCheckoutOpen(false)}
        cart={cart}
        subtotal={subtotal}
        settings={settings}
        onSuccess={() => { setCart([]); setCheckoutOpen(false) }}
      />
    </div>
  )
}

function ProductDialog({ product, globalAddons = [], onClose, onAdd }) {
  const [qty, setQty] = useState(1)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [notes, setNotes] = useState('')

  useEffect(() => { setQty(1); setSelectedAddons([]); setNotes('') }, [product?.id])

  if (!product) return null

  // Merge product-specific addons with global ones (product-specific take precedence by name)
  const productNames = new Set((product.addons || []).map(a => a.name))
  const merged = [
    ...(product.addons || []),
    ...globalAddons.filter(a => !productNames.has(a.name)).map(a => ({ name: a.name, price: a.price || 0 })),
  ]

  const addonsTotal = selectedAddons.reduce((s,a)=>s+(a.price||0),0)
  const total = (product.price + addonsTotal) * qty

  const toggleAddon = (a) => {
    setSelectedAddons(prev => prev.find(x=>x.name===a.name) ? prev.filter(x=>x.name!==a.name) : [...prev, a])
  }

  return (
    <Dialog open={!!product} onOpenChange={(o)=>!o && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden w-[calc(100vw-1rem)] sm:w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        <div className="h-40 sm:h-48 bg-neutral-100 relative shrink-0">
          {product.image && <img src={product.image} className="w-full h-full object-cover"/>}
        </div>
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <DialogTitle className="text-xl sm:text-2xl font-black">{product.name}</DialogTitle>
            <p className="text-sm text-neutral-600 mt-1">{product.description}</p>
            <div className="mt-2 text-xl sm:text-2xl font-black text-red-600">{fmtBRL(product.price)}</div>
          </div>

          {merged.length > 0 && (
            <div>
              <div className="font-bold mb-2 text-sm">Complementos</div>
              <div className="space-y-2">
                {merged.map((a,i)=>(
                  <label key={i} className="flex items-center justify-between cursor-pointer bg-neutral-50 hover:bg-amber-50 border rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={!!selectedAddons.find(x=>x.name===a.name)} onCheckedChange={()=>toggleAddon(a)}/>
                      <span className="text-sm font-medium">{a.name}</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">{a.price > 0 ? `+ ${fmtBRL(a.price)}` : 'Grátis'}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-bold">Observações (opcional)</Label>
            <Textarea placeholder="Ex: sem cebola, bem passado..." value={notes} onChange={e=>setNotes(e.target.value)} className="mt-1"/>
          </div>
        </div>
        <DialogFooter className="p-4 border-t bg-neutral-50 sm:justify-between gap-2">
          <div className="flex items-center gap-2 border rounded-full bg-white">
            <Button size="icon" variant="ghost" onClick={()=>setQty(Math.max(1,qty-1))}><Minus className="w-4 h-4"/></Button>
            <span className="font-bold w-6 text-center">{qty}</span>
            <Button size="icon" variant="ghost" onClick={()=>setQty(qty+1)}><Plus className="w-4 h-4"/></Button>
          </div>
          <Button className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold" onClick={()=>onAdd(product, qty, selectedAddons, notes)}>
            Adicionar • {fmtBRL(total)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CheckoutDialog({ open, onClose, cart, subtotal, settings, onSuccess }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [deliveryType, setDeliveryType] = useState('delivery')
  const [address, setAddress] = useState({ street: '', number: '', neighborhood: '', complement: '', reference: '', cep: '' })
  const [payment, setPayment] = useState('pix')
  const [changeFor, setChangeFor] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (!open) { setStep(1); setCoupon(null); setCouponCode('') } }, [open])

  const neighborhoods = settings?.neighborhoods || []
  const selectedNeighborhood = neighborhoods.find(n => n.name === address.neighborhood)
  const deliveryFee = deliveryType === 'delivery'
    ? (selectedNeighborhood ? Number(selectedNeighborhood.fee || 0) : Number(settings?.deliveryFee || 0))
    : 0
  const discount = coupon ? (coupon.type === 'percent' ? subtotal * (coupon.value/100) : coupon.value) : 0
  const total = Math.max(0, subtotal + deliveryFee - discount)

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      const r = await fetch('/api/coupons/validate', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({code: couponCode})})
      if (!r.ok) throw new Error()
      const c = await r.json()
      setCoupon(c)
      toast.success(`Cupom ${c.code} aplicado!`)
    } catch { toast.error('Cupom inválido'); setCoupon(null) }
  }

  const finalNeighborhood = address.neighborhood === '__other__' ? (address.otherNeighborhood || '') : address.neighborhood

  const buildWhatsAppMessage = (orderNumber) => {
    const lines = []
    lines.push('==========================')
    lines.push(`🔥 NOVO PEDIDO #${orderNumber}`)
    lines.push('==========================')
    lines.push('')
    lines.push(`👤 Cliente: ${name}`)
    lines.push(`📞 Telefone: ${phone}`)
    lines.push('')
    if (deliveryType === 'delivery') {
      lines.push('🛵 Entrega: SIM')
      lines.push(`📍 Endereço: ${address.street}, ${address.number}`)
      if (finalNeighborhood) lines.push(`Bairro: ${finalNeighborhood}`)
      if (address.complement) lines.push(`Complemento: ${address.complement}`)
      if (address.reference) lines.push(`Referência: ${address.reference}`)
      if (address.cep) lines.push(`CEP: ${address.cep}`)
    } else {
      lines.push('🏪 Retirada no local')
    }
    lines.push('')
    lines.push('🛒 Produtos:')
    cart.forEach(i => {
      lines.push(`• ${i.quantity}x ${i.name} — ${fmtBRL(i.price * i.quantity)}`)
      if (i.addons?.length) lines.push(`   ↳ ${i.addons.map(a=>a.name).join(', ')}`)
      if (i.notes) lines.push(`   ↳ Obs: ${i.notes}`)
    })
    lines.push('')
    lines.push(`💰 Subtotal: ${fmtBRL(subtotal)}`)
    if (deliveryFee) lines.push(`🛵 Taxa entrega: ${fmtBRL(deliveryFee)}`)
    if (discount) lines.push(`🎟️ Desconto (${coupon.code}): -${fmtBRL(discount)}`)
    lines.push(`*TOTAL: ${fmtBRL(total)}*`)
    lines.push('')
    lines.push(`💳 Pagamento: ${payment.toUpperCase()}`)
    if (payment === 'dinheiro' && changeFor) lines.push(`Troco para: ${fmtBRL(Number(changeFor))}`)
    if (notes) { lines.push(''); lines.push(`📝 Observações: ${notes}`) }
    lines.push('')
    lines.push('==========================')
    return lines.join('\n')
  }

  const submit = async () => {
    if (!name || !phone) { toast.error('Preencha nome e telefone'); return }
    if (deliveryType === 'delivery' && (!address.street || !address.number)) { toast.error('Preencha o endereço'); return }
    setLoading(true)
    try {
      const orderPayload = {
        customer: { name, phone },
        items: cart.map(i => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: i.price, addons: i.addons, notes: i.notes })),
        deliveryType, address: deliveryType === 'delivery' ? { ...address, neighborhood: finalNeighborhood } : null,
        payment, changeFor: payment === 'dinheiro' ? changeFor : null,
        coupon: coupon?.code || null,
        subtotal, deliveryFee, discount, total, notes,
      }
      const r = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(orderPayload) })
      const order = await r.json()
      const message = buildWhatsAppMessage(order.orderNumber)
      const url = `https://wa.me/${settings?.whatsapp}?text=${encodeURIComponent(message)}`
      window.open(url, '_blank')
      toast.success(`Pedido #${order.orderNumber} realizado! Abrindo WhatsApp...`)
      onSuccess()
    } catch (e) { toast.error('Erro ao enviar pedido') }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o)=>!o && onClose()}>
      <DialogContent className="max-w-lg w-[calc(100vw-1rem)] sm:w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-black flex items-center gap-2"><MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"/> Finalizar Pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Data */}
          <div className="space-y-3">
            <div className="font-bold text-sm text-neutral-700">1. Seus dados</div>
            <Input placeholder="Nome completo" value={name} onChange={e=>setName(e.target.value)}/>
            <Input placeholder="Telefone (WhatsApp)" value={phone} onChange={e=>setPhone(e.target.value)}/>
          </div>

          {/* Delivery */}
          <div className="space-y-2">
            <div className="font-bold text-sm text-neutral-700">2. Forma de entrega</div>
            <RadioGroup value={deliveryType} onValueChange={setDeliveryType} className="grid grid-cols-2 gap-2">
              <label className={`border rounded-xl p-3 cursor-pointer flex items-center gap-2 ${deliveryType==='delivery'?'border-red-600 bg-red-50':''}`}>
                <RadioGroupItem value="delivery"/> <Truck className="w-4 h-4"/> Entrega
              </label>
              <label className={`border rounded-xl p-3 cursor-pointer flex items-center gap-2 ${deliveryType==='pickup'?'border-red-600 bg-red-50':''}`}>
                <RadioGroupItem value="pickup"/> <Store className="w-4 h-4"/> Retirada
              </label>
            </RadioGroup>
          </div>

          {deliveryType === 'delivery' && (
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Rua" value={address.street} onChange={e=>setAddress({...address, street:e.target.value})} className="col-span-2"/>
              <Input placeholder="Número" value={address.number} onChange={e=>setAddress({...address, number:e.target.value})}/>
              {neighborhoods.length > 0 ? (
                <select
                  value={address.neighborhood || ''}
                  onChange={e=>setAddress({...address, neighborhood: e.target.value})}
                  className="border border-input rounded-md px-3 h-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Selecione o bairro...</option>
                  {neighborhoods.map(n => (
                    <option key={n.id || n.name} value={n.name}>
                      {n.name} {Number(n.fee) > 0 ? `— R$ ${Number(n.fee).toFixed(2)}` : '— Grátis'}
                    </option>
                  ))}
                  <option value="__other__">Outro bairro</option>
                </select>
              ) : (
                <Input placeholder="Bairro" value={address.neighborhood} onChange={e=>setAddress({...address, neighborhood:e.target.value})}/>
              )}
              {address.neighborhood === '__other__' && (
                <Input placeholder="Digite o bairro" value={address.otherNeighborhood||''} onChange={e=>setAddress({...address, otherNeighborhood:e.target.value, neighborhood: e.target.value ? e.target.value : '__other__'})} className="col-span-2"/>
              )}
              <Input placeholder="Complemento" value={address.complement} onChange={e=>setAddress({...address, complement:e.target.value})}/>
              <Input placeholder="Referência" value={address.reference} onChange={e=>setAddress({...address, reference:e.target.value})}/>
              <Input placeholder="CEP (opcional)" value={address.cep} onChange={e=>setAddress({...address, cep:e.target.value})} className="col-span-2"/>
              {neighborhoods.length > 0 && (
                <div className="col-span-2 text-xs text-neutral-500 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  {selectedNeighborhood
                    ? <>📍 <b>{selectedNeighborhood.name}</b> — taxa de entrega: <b className="text-red-600">{Number(selectedNeighborhood.fee) > 0 ? fmtBRL(selectedNeighborhood.fee) : 'Grátis'}</b></>
                    : (address.neighborhood === '__other__'
                        ? <>⚠️ Bairro fora da lista — será cobrada a taxa padrão de <b>{fmtBRL(settings?.deliveryFee || 0)}</b> (confirmar via WhatsApp)</>
                        : <>Selecione seu bairro para calcular a taxa de entrega automaticamente.</>)
                  }
                </div>
              )}
            </div>
          )}

          {/* Payment */}
          <div className="space-y-2">
            <div className="font-bold text-sm text-neutral-700">3. Pagamento</div>
            <RadioGroup value={payment} onValueChange={setPayment} className="grid grid-cols-2 gap-2">
              {[
                { v: 'pix', l: 'Pix', i: DollarSign },
                { v: 'dinheiro', l: 'Dinheiro', i: DollarSign },
                { v: 'credito', l: 'Cartão Crédito', i: CreditCard },
                { v: 'debito', l: 'Cartão Débito', i: CreditCard },
              ].map(o=>(
                <label key={o.v} className={`border rounded-xl p-3 cursor-pointer flex items-center gap-2 ${payment===o.v?'border-red-600 bg-red-50':''}`}>
                  <RadioGroupItem value={o.v}/> <o.i className="w-4 h-4"/> {o.l}
                </label>
              ))}
            </RadioGroup>
            {payment === 'dinheiro' && (
              <Input placeholder="Troco para quanto? (opcional)" value={changeFor} onChange={e=>setChangeFor(e.target.value)}/>
            )}
          </div>

          {/* Coupon */}
          <div>
            <div className="font-bold text-sm text-neutral-700 mb-2">4. Cupom (opcional)</div>
            <div className="flex gap-2">
              <Input placeholder="Ex: FRANGO10" value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())} disabled={!!coupon}/>
              {!coupon ? <Button variant="outline" onClick={applyCoupon}>Aplicar</Button> : <Button variant="outline" onClick={()=>{setCoupon(null); setCouponCode('')}}>Remover</Button>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="font-bold text-sm text-neutral-700 mb-2">5. Observações do pedido</div>
            <Textarea placeholder="Alguma observação geral?" value={notes} onChange={e=>setNotes(e.target.value)}/>
          </div>

          {/* Summary */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{fmtBRL(subtotal)}</span></div>
            {deliveryFee > 0 && <div className="flex justify-between"><span>Taxa de entrega</span><span>{fmtBRL(deliveryFee)}</span></div>}
            {discount > 0 && <div className="flex justify-between text-green-700"><span>Desconto ({coupon?.code})</span><span>- {fmtBRL(discount)}</span></div>}
            <div className="flex justify-between text-lg font-black text-red-600 border-t pt-1 mt-1"><span>Total</span><span>{fmtBRL(total)}</span></div>
          </div>

          <Button disabled={loading || !cart.length} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black text-base" onClick={submit}>
            {loading ? 'Enviando...' : (<><MessageCircle className="w-5 h-5 mr-2"/> Finalizar Pedido e Enviar no WhatsApp</>)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
