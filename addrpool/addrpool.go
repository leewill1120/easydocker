package addrpool

import (
	"docker-webClient/ping"
	"fmt"
	"log"
	"math/rand"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

var (
	mutex sync.Mutex
)

//地址状态
const (
	init_s = iota
	free_s
	inUse_s
)

type addrInfo struct {
	Addr      string
	Status    int
	Allocated bool
}

func (ai *addrInfo) updateStatus(st int) {
	ai.Status = st
}

func (ai *addrInfo) updateAllocated(al bool) {
	ai.Allocated = al
}

type addrList []addrInfo

func (a addrList) Len() int {
	return len(a)
}

func (a addrList) Less(i, j int) bool {

	if ipTransStrToUint32(a[i].Addr) < ipTransStrToUint32(a[j].Addr) {
		return true
	} else {
		return false
	}
}

func (a addrList) Swap(i, j int) {
	a[i], a[j] = a[j], a[i]
}

type AddrPool struct {
	addrMap map[string]*addrInfo
}

func (ap AddrPool) String() string {
	var list addrList
	str := ""
	for _, info := range ap.addrMap {
		list = append(list, addrInfo{Addr: info.Addr, Status: info.Status, Allocated: info.Allocated})
	}
	sort.Sort(list)
	for _, l := range list {
		str += l.Addr + " -> " + strconv.Itoa(l.Status) + " " + fmt.Sprintf("%t", l.Allocated) + "\n"
	}
	return str
}

func (ap *AddrPool) New(cidrs []string) {
	for _, cidr := range cidrs {
		network_str := strings.Split(cidr, "/")[0]
		mask, _ := strconv.Atoi(strings.Split(cidr, "/")[1])
		network := (ipTransStrToUint32(network_str) >> uint(32-mask)) << uint(32-mask)

		var maxHost uint32
		for i := 0; i < 32-mask; i++ {
			maxHost = (maxHost << 1) + 1
		}

		for host := uint32(0); host <= maxHost; host++ {
			ipaddr := ipTransUint32ToStr(network | host)
			ap.addrMap[ipaddr] = &addrInfo{Addr: ipaddr, Status: init_s, Allocated: false}
		}
	}
}

func (ap *AddrPool) checkAddr(internal_sec time.Duration, timeout_msec time.Duration) {
	for _, addrInfo := range ap.addrMap {
		go func(addr string) {
			if !isValidIP(addr) {
				log.Printf("Invalid IP %s", addr)
			} else {
				rd := rand.New(rand.NewSource(time.Now().UnixNano()))
				time.Sleep(time.Second * time.Duration(rd.Intn(int(internal_sec))))
				for {
					if ping.Ping(addr, timeout_msec) {
						mutex.Lock()
						if ap.addrMap[addr].Status != inUse_s {
							ap.addrMap[addr].updateStatus(inUse_s)
						}
						mutex.Unlock()
					} else {
						mutex.Lock()
						if ap.addrMap[addr].Status != free_s {
							ap.addrMap[addr].updateStatus(free_s)
						}
						mutex.Unlock()
					}
					time.Sleep(time.Second * internal_sec)
				}
			}
		}(addrInfo.Addr)
	}
}

func (ap AddrPool) AllocAddr() (string, error) {
	for addr, addInfo := range ap.addrMap {
		if free_s == addInfo.Status {
			mutex.Lock()
			ap.addrMap[addr].updateAllocated(true)
			mutex.Unlock()
			return addr, nil
		}
	}
	return "", fmt.Errorf("No free addr to alloc.")
}

func (ap AddrPool) FreeAddr(addr string) error {
	if _, exists := ap.addrMap[addr]; exists {
		mutex.Lock()
		ap.addrMap[addr].updateAllocated(false)
		mutex.Unlock()
		return nil
	} else {
		return fmt.Errorf("not found addr %s", addr)
	}
}

func (ap AddrPool) GetPoolSize() int {
	return len(ap.addrMap)
}

func NewAddrPool(cidrs []string) (*AddrPool, error) {
	for _, cidr := range cidrs {
		if !isValidCidr(cidr) {
			return nil, fmt.Errorf("Invalid CIDR %s", cidr)
		}
	}
	ap := &AddrPool{
		addrMap: make(map[string]*addrInfo),
	}
	ap.New(cidrs)
	ap.checkAddr(10, 1000)
	return ap, nil
}

func DestoryAddrPool(ap *AddrPool) error {
	return nil
}

func isValidIP(ipaddr string) bool {
	segs := strings.Split(ipaddr, ".")
	if len(segs) != 4 {
		return false
	} else {
		for _, seg := range segs {
			if n, e := strconv.Atoi(seg); e == nil {
				if n < 0 || n > 255 {
					return false
				}
			} else {
				return false
			}
		}
	}
	return true
}

func isValidCidr(cidr string) bool {
	if !strings.Contains(cidr, "/") {
		return false
	} else {
		return isValidIP(strings.Split(cidr, "/")[0])
	}
}

func ipTransStrToUint32(ipaddr string) uint32 {
	b1, _ := strconv.Atoi(strings.Split(ipaddr, ".")[0])
	b2, _ := strconv.Atoi(strings.Split(ipaddr, ".")[1])
	b3, _ := strconv.Atoi(strings.Split(ipaddr, ".")[2])
	b4, _ := strconv.Atoi(strings.Split(ipaddr, ".")[3])
	return uint32((b1 << 24) + (b2 << 16) + (b3 << 8) + (b4 & 0xff))
}

func ipTransUint32ToStr(ipaddr uint32) string {
	return strconv.Itoa(int(ipaddr>>24)) + "." + strconv.Itoa(int(ipaddr>>16&0xff)) + "." + strconv.Itoa(int(ipaddr>>8&0xff)) + "." + strconv.Itoa(int(ipaddr&0xff))
}
